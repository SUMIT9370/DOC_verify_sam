import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import tempfile
import time
from pathlib import Path
import json
import sys
import numpy as np

# Ensure utils are in the path when run from a different directory
sys.path.append(str(Path(__file__).parent.resolve()))

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

def run_analysis_pipeline(image_path: str):
    """Execute all 7 analysis stages on a document image and return results."""
    results = {}
    
    # Stage 1: Error Level Analysis
    ela_map, anomaly = compute_ela_analysis(image_path)
    if ela_map is not None:
        results["image_quality"] = {"anomaly_score": anomaly}
    else:
        results["image_quality"] = {"anomaly_score": 0.0}
    
    # Stage 2: OCR Text Extraction
    ocr_engine = initialize_ocr_engine()
    ocr_data = extract_document_text(image_path, ocr_engine)
    results["ocr"] = ocr_data
    
    # Stage 3: QR Code Detection
    qr_data = find_qr_codes(image_path)
    results["qr"] = qr_data
    
    # Stage 4: Watermark Verification
    watermark_data = locate_watermark(image_path, WATERMARK_TEMPLATE_PATH)
    authenticity = score_watermark_authenticity(watermark_data)
    watermark_data["authenticity_score"] = authenticity
    results["watermark"] = watermark_data
    
    # Stage 5: Layout Analysis
    layout_data = analyze_document_structure(image_path)
    results["layout"] = layout_data
    
    # Stage 6: ML Classification
    model, device = load_classifier_model()
    ml_result = classify_document(image_path, model, device)
    results["ml_model"] = ml_result
    
    # Stage 7: Final Validation
    verdict = compute_final_verdict(results)
    
    return results, verdict

def main(image_path: str):
    """Main function to run the analysis and print JSON output to stdout."""
    try:
        stage_results, final_verdict = run_analysis_pipeline(image_path)
        
        # This class helps serialize numpy types that are not JSON-native
        class NumpyEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, (np.integer, np.floating, np.bool_)):
                    return obj.item()
                if isinstance(obj, np.ndarray):
                    return obj.tolist()
                return super(NumpyEncoder, self).default(obj)
        
        # Prepare the final output object
        output = {
            "stage_results": stage_results,
            "final_verdict": final_verdict,
        }

        # Clean up non-serializable data before printing
        if 'ocr' in output['stage_results'] and 'words' in output['stage_results']['ocr']:
            for word in output['stage_results']['ocr']['words']:
                if 'bbox' in word:
                    del word['bbox']

        # Print the final JSON to stdout
        print(json.dumps(output, cls=NumpyEncoder))

    except Exception as e:
        logger.error(f"An error occurred in the main analysis pipeline: {e}", exc_info=True)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    # The script expects the image path as the first command-line argument.
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided as an argument."}))
        sys.exit(1)
    
    input_image_path = sys.argv[1]
    main(input_image_path)
