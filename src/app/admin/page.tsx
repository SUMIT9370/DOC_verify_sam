import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MasterUploader } from "./components/master-uploader";

export default function AdminPage() {
    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    System-wide monitoring and database management.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Upload New Document Master</CardTitle>
                        <CardDescription>
                            Add a new verified document template to the central database for future comparisons.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MasterUploader />
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
                       <div className="flex justify-between items-center">
                            <span className="font-medium">Master Templates in DB</span>
                            <span className="font-bold text-2xl">1,230</span>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    