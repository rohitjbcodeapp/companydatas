import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DataTablePage() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`/api/uploads/${id}/data`)
      .then((res) => setData(res.data.data || []));
  }, [id]);

  const filtered = data.filter(row =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-6">
      <h1 className="text-2xl font-bold">Uploaded Data</h1>
      <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <Table>
        <TableHeader>
          <TableRow>
            {data[0] && Object.keys(data[0]).map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row, i) => (
            <TableRow key={i}>
              {Object.values(row).map((val, j) => (
                <TableCell key={j}>{String(val)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
