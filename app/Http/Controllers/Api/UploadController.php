<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadFileRequest;
use App\Jobs\ProcessUploadJob;
use App\Models\UploadHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str; 

class UploadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UploadFileRequest $request)
    {
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $ext = strtolower($file->getClientOriginalExtension());
        $storedName = time() . '_' . Str::random(8) . '.' . $ext;
        $path = $file->storeAs('uploads', $storedName);

        $upload = UploadHistory::create([
            'filename' => $storedName,
            'original_filename' => $originalName,
            'file_size' => $file->getSize(),
            'data_type' => $request->data_type,
            'file_type' => $ext === 'csv' ? 'csv' : 'excel',
            'status' => 'uploaded',
            'apollo_url' => $request->apollo_url,
            'custom_file_name' => $request->custom_file_name,
            'file_url' => Storage::url($path),
        ]);

        ProcessUploadJob::dispatch($upload);

        return response()->json(['message' => 'File uploaded', 'upload' => $upload]);
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
