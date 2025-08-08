import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState("email");
  const [apolloUrl, setApolloUrl] = useState("");
  const [customFileName, setCustomFileName] = useState("");
  const [progress, setProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("data_type", dataType);
    formData.append("apollo_url", apolloUrl);
    formData.append("custom_file_name", customFileName);

    try {
      const res = await axios.post(
        "http://companydatas.test/api/uploads",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.round((event.loaded * 100) / event.total));
            }
          },
        }
      );
      setUploadResult(res.data.upload);
    } catch (err: unknown) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 p-6">
      <h1 className="text-2xl font-bold">Upload File</h1>
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Select value={dataType} onValueChange={setDataType}>
        <SelectTrigger>
          <SelectValue placeholder="Select Data Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="email">Company Data</SelectItem>
          <SelectItem value="whatsapp">WhatsApp Data</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder="Apollo URL" value={apolloUrl} onChange={(e) => setApolloUrl(e.target.value)} />
      <Input placeholder="Custom File Name" value={customFileName} onChange={(e) => setCustomFileName(e.target.value)} />
      {progress > 0 && <Progress value={progress} />}
      <Button onClick={handleUpload}>Upload</Button>
      {uploadResult && (
        <div className="p-4 bg-green-100 rounded">
          <p>Upload queued for processing.</p>
          <p>ID: {uploadResult.id}</p>
        </div>
      )}
    </div>
  );
}
