import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        System-wide monitoring and database management.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload New Document Master</CardTitle>
                            <CardDescription>
                                Add a new verified document template to the central database for future comparisons.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg">
                            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                            <Button>
                                Upload Template
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">.PDF, .DOCX, or image files</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Statistics</CardTitle>
                            <CardDescription>
                                Overview of all verifications performed on DuckVerify.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex justify-between items-center">
                                <span className="font-medium">Total Verifications Today</span>
                                <span className="font-bold text-2xl text-primary">23,498</span>
                           </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total Fakes Detected (All Time)</span>
                                <span className="font-bold text-2xl text-destructive">1,102,334</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="font-medium">Active University Partners</span>
                                <span className="font-bold text-2xl">856</span>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
