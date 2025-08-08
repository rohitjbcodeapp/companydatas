import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppHeader } from "@/components/app-header";
import axios from "@/lib/axios";
import { router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type BreadcrumbItem } from '@/types';
import AppLayout from "@/layouts/app-layout";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Mapping',
    href: '/mapping',
  }
];
type PageProps = {
  id: string;
};

function normalizeColumnName(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^a-z0-9]+/g, "");
}

function buildAutoMappings(fileColumns: string[], dbColumns: string[]) {
  const normalizedDbToOriginal: Record<string, string> = {};
  const usedFileColumns = new Set<string>();

  fileColumns.forEach((fileCol) => {
    normalizedDbToOriginal[normalizeColumnName(fileCol)] = fileCol;
  });

  const synonyms: Record<string, string[]> = {
    email_address: [
      "email",
      "emailaddress",
      "primaryemail",
      "personalemail",
      "personalemails",
      "personalemails0",
      "workemail",
    ],
    mobile_number: [
      "mobile",
      "mobilenumber",
      "phone",
      "phonenumber",
      "contact",
      "contactnumber",
      "whatsapp",
      "whatsappnumber",
    ],
    first_name: ["firstname", "givenname", "given_name", "first_name", "first name"],
    last_name: ["lastname", "surname", "familyname", "last_name", "last name"],
    company: ["company", "companyname", "organization", "organisation", "employer", "currentcompany"],
    job_title: ["jobtitle", "title", "designation", "position", "role"],
    city: ["city", "currentcity", "addresscity"],
    country: ["country", "countryname", "nation"],
    website: ["website", "url", "site", "companywebsite"],
    address: ["address", "street", "streetaddress", "addr"],
    state: ["state", "province", "region"],
    zip_code: ["zip", "zipcode", "postal", "postalcode", "pincode"],
    linkedin_url: ["linkedin", "linkedinurl", "linkedinprofile", "linkedinid"],
    twitter_url: ["twitter", "twitterurl"],
  };

  // Build an alias -> real db column map, but only include aliases whose real column exists in db
  const aliasToDbColumn: Record<string, string> = {};
  Object.entries(synonyms).forEach(([dbCol, aliases]) => {
    if (dbColumns.includes(dbCol)) {
      aliases.forEach((alias) => {
        aliasToDbColumn[normalizeColumnName(alias)] = dbCol;
      });
    }
  });

  const mappings: any[] = [];

  dbColumns.forEach((dbCol) => {
    const normalizedDb = normalizeColumnName(dbCol);

    // 1) Exact match on normalized name
    let source: string | "" = "";
    const exactFile = normalizedDbToOriginal[normalizedDb];
    if (exactFile && !usedFileColumns.has(exactFile)) {
      source = exactFile;
      usedFileColumns.add(exactFile);
    }

    // 2) Alias/synonym match
    if (!source) {
      const aliasTarget = aliasToDbColumn[normalizedDb];
      if (aliasTarget === dbCol) {
        // Find matching file column for this db column
        for (const fileCol of fileColumns) {
          const nFile = normalizeColumnName(fileCol);
          if (synonyms[dbCol]?.includes(nFile) && !usedFileColumns.has(fileCol)) {
            source = fileCol;
            usedFileColumns.add(fileCol);
            break;
          }
        }
      }
    }

    // 3) Containment heuristic (e.g., source contains db or db contains source)
    if (!source) {
      for (const fileCol of fileColumns) {
        const nFile = normalizeColumnName(fileCol);
        if (
          (normalizedDb.includes(nFile) || nFile.includes(normalizedDb)) &&
          !usedFileColumns.has(fileCol)
        ) {
          source = fileCol;
          usedFileColumns.add(fileCol);
          break;
        }
      }
    }

    mappings.push({
      source_column: source,
      target_column: dbCol,
      is_selected: Boolean(source),
    });
  });

  return mappings;
}

export default function MappingPage() {
  const { props } = usePage<PageProps>();
  const id = String((props as any).id ?? "");

  const [fileCols, setFileCols] = useState<string[]>([]);
  const [dbCols, setDbCols] = useState<string[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      console.log("No ID found:", props);
      setIsLoading(false);
      return;
    }

    console.log("Loading columns for ID:", id);
    axios
      .get(`/api/uploads/${id}/columns`)
      .then((res) => {
        console.log("API Response:", res.data);
        // Filter out empty column names
        const validFileCols = (res.data.file_columns || []).filter((col: string) => col && col.trim() !== '');
        const validDbCols = (res.data.db_columns || []).filter((col: string) => col && col.trim() !== '');

        // Filter out Laravel's automatic columns that shouldn't be mapped
        const excludedColumns = [
          'id', 'upload_id', 'created_at', 'updated_at', 'deleted_at'
        ];
        const mappableDbCols = validDbCols.filter((col: string) => !excludedColumns.includes(col));

        console.log("Valid file columns:", validFileCols);
        console.log("Mappable DB columns:", mappableDbCols);

        setFileCols(validFileCols);
        setDbCols(mappableDbCols);
        // Auto mapping here
        const auto = buildAutoMappings(validFileCols, mappableDbCols);
        setMappings(auto);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setIsLoading(false);
      });
  }, [id, props]);

  const handleMappingChange = (index: number, value: string) => {
    const updated = [...mappings];
    updated[index].target_column = value === "skip" ? "" : value;
    updated[index].is_selected = Boolean(updated[index].target_column);
    setMappings(updated);
  };

  const saveMappings = async () => {
    setIsSaving(true);
    try {
      // Filter out mappings that are skipped or have no target column
      const validMappings = mappings.filter(mapping =>
        mapping.target_column && mapping.target_column !== "skip"
      );

      await axios.post(`/api/uploads/${id}/mappings`, { mappings: validMappings });
      router.visit("/companies");
    } catch (error) {
      console.error("Error saving mappings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>

        <div className="min-h-screen bg-background">
          {/* <AppHeader /> */}
          <div className="container mx-auto p-6">
            <div className="text-center">Loading columns...</div>
          </div>
        </div>
      </AppLayout>

    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>

      <div className="min-h-screen bg-background">
        {/* <AppHeader /> */}
        <div className="container mx-auto max-w-4xl space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Map Columns</h1>
            <Button onClick={saveMappings} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save & Process Data"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Column Mapping ({fileCols.length} file columns, {dbCols.length} DB columns)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fileCols.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No file columns found. Please check the API response.
                  <br />
                  <small>Check browser console for debug info.</small>
                </div>
              ) : (
                dbCols.map((dbCol, idx) => (
                  <div key={dbCol} className="flex gap-4 items-center p-3 border rounded-lg">
                    <div className="flex-1 font-medium text-gray-600">{dbCol}</div>
                    <Select
                      value={mappings.find(m => m.target_column === dbCol)?.source_column || ""}
                      onValueChange={(val) => {
                        const mappingIndex = mappings.findIndex(m => m.target_column === dbCol);
                        if (mappingIndex >= 0) {
                          handleMappingChange(mappingIndex, val);
                        } else {
                          // Create new mapping
                          const newMapping = {
                            source_column: val,
                            target_column: dbCol,
                            is_selected: true,
                          };
                          setMappings([...mappings, newMapping]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Excel Column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Skip this column</SelectItem>
                        {fileCols.map((fileCol) => (
                          <SelectItem key={fileCol} value={fileCol}>
                            {fileCol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
              {/* {fileCols.length > 10 && (
              <div className="text-center py-4 text-gray-500">
                Showing first 10 columns of {fileCols.length} total columns
              </div>
            )} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>

  );
}
