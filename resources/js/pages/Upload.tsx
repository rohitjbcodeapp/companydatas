import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/app-header";
import axios from "@/lib/axios";
import { router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Upload',
    href: '/upload',
  }
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState("email");
  const [apolloUrl, setApolloUrl] = useState("");
  const [customFileName, setCustomFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data_type", dataType);
    formData.append("apollo_url", apolloUrl);
    formData.append("custom_file_name", customFileName);

    try {
      const res = await axios.post(
        "/api/uploads",
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

      // Redirect to mapping page after successful upload
      router.visit(`/mapping/${res.data.upload.id}`);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>

      <div className="min-h-screen bg-background">
        {/* <AppHeader /> */}
        <div className="container mx-auto max-w-lg space-y-4 p-6">
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
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </AppLayout>

  );
}
