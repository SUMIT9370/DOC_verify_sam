import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
  
const historyData = [
    { id: 'DOC-1250', type: 'B.Tech Degree', date: '2024-05-23', status: 'Authentic' },
    { id: 'DOC-1249', type: 'Marksheet - 12th', date: '2024-05-22', status: 'Fake Detected' },
    { id: 'DOC-1248', type: 'Aadhar Card', date: '2024-05-22', status: 'Authentic' },
    { id: 'DOC-1247', type: 'Passport', date: '2024-05-21', status: 'Authentic' },
    { id: 'DOC-1246', type: 'Marksheet - 10th', date: '2024-05-20', status: 'Fake Detected' },
    { id: 'DOC-1245', type: 'PAN Card', date: '2024-05-19', status: 'Authentic' },
    { id: 'DOC-1244', type: 'Birth Certificate', date: '2024-05-18', status: 'Authentic' },
];

export default function HistoryPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Verification History</h1>
                <p className="text-muted-foreground">
                Browse and search through all your past document verifications.
                </p>
            </div>

            <div className="border rounded-lg shadow-md bg-card">
                 <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by Document ID or Type..." className="pl-10" />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Document ID</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead className="text-right w-[180px]">Verification Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {historyData.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                            <Badge variant={item.status === 'Authentic' ? 'default' : 'destructive'} className={item.status === 'Authentic' ? 'bg-green-600' : ''}>
                                {item.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.date}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                <div className="p-4 border-t flex justify-end">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                        <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                        <PaginationLink href="#">
                            2
                        </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                        <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                        <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}
