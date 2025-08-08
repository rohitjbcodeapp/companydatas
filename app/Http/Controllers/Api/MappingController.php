<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveMappingsRequest;
use App\Models\ColumnMapping;
use App\Models\UploadHistory;
use App\Jobs\ProcessUploadJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class MappingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function columns($id)
    {
        $upload = UploadHistory::findOrFail($id);
        $table = $upload->data_type === 'email' ? 'companies' : 'whatsapp_data';
        $dbColumns = Schema::getColumnListing($table);

        $filePath = Storage::path('uploads/' . $upload->filename);
        $arrays = Excel::toArray(null, $filePath);
        $firstRow = $arrays[0][0] ?? [];
        
        // Get actual column names from the first row, filter out empty ones
        $fileColumns = [];
        foreach ($firstRow as $index => $value) {
            $columnName = trim($value ?: "Column_" . $index);
            if (!empty($columnName)) {
                $fileColumns[] = $columnName;
            }
        }

        return response()->json(['file_columns' => $fileColumns, 'db_columns' => $dbColumns]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveMappingsRequest $request, $id)
    {
        $upload = UploadHistory::findOrFail($id);
        
        // Clear existing mappings
        ColumnMapping::where('upload_id', $upload->id)->delete();

        // Save new mappings
        foreach ($request->mappings as $order => $map) {
            if (!empty($map['target_column'])) {
                ColumnMapping::create([
                    'upload_id' => $upload->id,
                    'source_column' => $map['source_column'] ?? null,
                    'target_column' => $map['target_column'] ?? null,
                    'is_selected' => $map['is_selected'] ?? true,
                    'column_order' => $map['column_order'] ?? $order,
                ]);
            }
        }

        // Update upload status and trigger processing
        $upload->update(['status' => 'chunked_processing']);
        
        // Dispatch the processing job
        ProcessUploadJob::dispatch($upload);

        return response()->json(['message' => 'Mappings saved and processing started']);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
