import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function MappingPage() {
  const { id } = useParams<{ id: string }>();
  const [fileCols, setFileCols] = useState<string[]>([]);
  const [dbCols, setDbCols] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mappings, setMappings] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`http://companydatas.test/api/uploads/${id}/columns`)
      .then((res) => {
        setFileCols(res.data.file_columns || []);
        setDbCols(res.data.db_columns || []);
        setMappings(res.data.file_columns.map((col: string) => ({
          source_column: col,
          target_column: "",
          is_selected: true,
        })));
      });
  }, [id]);

  const handleMappingChange = (index: number, value: string) => {
    const updated = [...mappings];
    updated[index].target_column = value;
    setMappings(updated);
  };

  const saveMappings = () => {
    axios.post(`http://companydatas.test/api/uploads/${id}/mappings`, { mappings })
      .then(() => alert("Mappings saved"))
      .catch(() => alert("Error saving mappings"));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Map Columns</h1>
      {fileCols.map((col, idx) => (
        <div key={col} className="flex gap-4 items-center">
          <div className="flex-1">{col}</div>
          <Select value={mappings[idx]?.target_column} onValueChange={(val) => handleMappingChange(idx, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select DB Column" />
            </SelectTrigger>
            <SelectContent>
              {dbCols.map((db) => (
                <SelectItem key={db} value={db}>{db}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      <Button onClick={saveMappings}>Save Mappings</Button>
    </div>
  );
}
