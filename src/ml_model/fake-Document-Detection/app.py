import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import tempfile
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional, Tuple
import json
import sys

# Since this is run from a different context, let's ensure utils are in the path
sys.path.append(os.path.dirname(__file__))

from PIL import Image
import fitz  # PyMuPDF

from utils.image_quality import compute_ela_analysis, save_ela_visualization
from utils.ocr_extraction import extract_document_text, write_ocr_results, initialize_ocr_engine
from utils.qr_detection import find_qr_codes, draw_qr_annotations
from utils.watermark_check import locate_watermark, score_watermark_authenticity
from utils.layout_check import analyze_document_structure, save_layout_overlay
from utils.validation import compute_final_verdict, persist_analysis_log
from utils.ml_model import classify_document, load_classifier_model
from utils.config import (
    ELA_OUTPUT_DIR, OCR_OUTPUT_DIR, QR_OUTPUT_DIR, 
    LAYOUT_OUTPUT_DIR, WATERMARK_TEMPLATE_PATH
)
from utils.logger import logger

def run_analysis_pipeline(image_path: str) -> Tuple[Dict, Dict]:
    """Execute all 7 analysis stages on a document image.
    
    Args:
        image_path: Path to uploaded document image
        
    Returns:
        Tuple of (stage_results_dict, final_verdict_dict)
    """
    results = {}
    
    # Stage 1: Error Level Analysis
    ela_map, anomaly = compute_ela_analysis(image_path)
    if ela_map is not None:
        ela_path = ELA_OUTPUT_DIR / "ela_result.png"
        save_ela_visualization(ela_map, str(ela_path))
        results["image_quality"] = {
            "anomaly_score": anomaly,
            "visualization_path": str(ela_path)
        }
    else:
        results["image_quality"] = {"anomaly_score": 0.0, "visualization_path": None}
    
    # Stage 2: OCR Text Extraction
    ocr_engine = initialize_ocr_engine()
    ocr_data = extract_document_text(image_path, ocr_engine)
    ocr_path = OCR_OUTPUT_DIR / "ocr_result.txt"
    write_ocr_results(ocr_data, str(ocr_path))
    results["ocr"] = {
        **ocr_data,
        "output_path": str(ocr_path)
    }
    
    # Stage 3: QR Code Detection
    qr_data = find_qr_codes(image_path)
    if qr_data["detected"]:
        qr_path = QR_OUTPUT_DIR / "qr_annotated.png"
        draw_qr_annotations(image_path, qr_data, str(qr_path))
        qr_data["visualization_path"] = str(qr_path)
    results["qr"] = qr_data
    
    # Stage 4: Watermark Verification
    watermark_data = locate_watermark(image_path, WATERMARK_TEMPLATE_PATH)
    authenticity = score_watermark_authenticity(watermark_data)
    watermark_data["authenticity_score"] = authenticity
    results["watermark"] = watermark_data
    
    # Stage 5: Layout Analysis
    layout_data = analyze_document_structure(image_path)
    if layout_data["valid"]:
        layout_path = LAYOUT_OUTPUT_DIR / "layout_visualization.png"
        save_layout_overlay(image_path, layout_data, str(layout_path))
        layout_data["visualization_path"] = str(layout_path)
    results["layout"] = layout_data
    
    # Stage 6: ML Classification
    model, device = load_classifier_model()
    ml_result = classify_document(image_path, model, device)
    results["ml_model"] = ml_result
    
    # Stage 7: Final Validation
    verdict = compute_final_verdict(results)
    persist_analysis_log(results, verdict)
    results["validation_log_path"] = str(Path("outputs/logs/last_run.json"))
    
    return results, verdict

def main(image_path: str):
    """Main function to run the analysis and print JSON output."""
    try:
        stage_results, final_verdict = run_analysis_pipeline(image_path)
        output = {
            "stage_results": stage_results,
            "final_verdict": final_verdict,
        }
        # A class to handle serialization of numpy types
        class NumpyEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, (np.integer, np.floating, np.bool_)):
                    return obj.item()
                if isinstance(obj, np.ndarray):
                    return obj.tolist()
                return super(NumpyEncoder, self).default(obj)
        
        # We need to serialize the output to JSON before printing it to stdout
        # because the calling Genkit flow expects JSON.
        # We also have to remove non-serializable data.
        if 'ocr' in output['stage_results']:
            # Bbox is a numpy array which is not serializable by default
            if 'words' in output['stage_results']['ocr']:
                for word in output['stage_results']['ocr']['words']:
                    if 'bbox' in word:
                        del word['bbox']

        # Print the JSON to stdout so the Genkit flow can capture it.
        print(json.dumps(output, cls=NumpyEncoder))

    except Exception as e:
        logger.error(f"An error occurred in the main analysis pipeline: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    # This script is designed to be called with the image path as an argument.
    # However, for simplicity in the Genkit 'run' command which doesn't easily pass args,
    # we will search for the latest uploaded image in the directory.
    # This is a HACK for this prototype environment. A real system would use a proper API.
    
    # Find the most recently created PNG file in the current directory.
    script_dir = Path(__file__).parent
    files = list(script_dir.glob('upload_*.png'))
    if not files:
        print(json.dumps({"error": "No upload_*.png file found to process."}))
        sys.exit(1)

    latest_file = max(files, key=os.path.getctime)
    main(str(latest_file))
