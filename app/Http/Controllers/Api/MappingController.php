<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveMappingsRequest;
use App\Models\ColumnMapping;
use App\Models\UploadHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
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

        $filePath = storage_path('app/uploads/' . $upload->filename);
        $arrays = Excel::toArray(null, $filePath);
        $firstRow = $arrays[0][0] ?? [];
        $fileColumns = array_keys($firstRow);

        return response()->json(['file_columns' => $fileColumns, 'db_columns' => $dbColumns]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveMappingsRequest $request, $id)
    {
        $upload = UploadHistory::findOrFail($id);
        ColumnMapping::where('upload_id', $upload->id)->delete();

        foreach ($request->mappings as $order => $map) {
            ColumnMapping::create([
                'upload_id' => $upload->id,
                'source_column' => $map['source_column'] ?? null,
                'target_column' => $map['target_column'] ?? null,
                'is_selected' => $map['is_selected'] ?? true,
                'column_order' => $map['column_order'] ?? $order,
            ]);
        }
        return response()->json(['message' => 'Mappings saved']);
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
