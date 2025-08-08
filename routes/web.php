<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\UploadController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::prefix('api/uploads')->group(function () {
        Route::post('/', [UploadController::class, 'store']); // Store file upload
        Route::get('/{id}', [UploadController::class, 'show']); // Show upload details
        Route::put('/{id}', [UploadController::class, 'update']); // Update upload details
        Route::delete('/{id}', [UploadController::class, 'destroy']); // Delete upload record
    });

    Route::get('/upload', fn() => Inertia::render('Upload'))->name('upload');

    Route::get('/mapping/{id}', fn($id) => Inertia::render('Mapping', ['id' => $id]))
        ->name('mapping');

    // Route::get('/data/{id}', fn($id) => Inertia::render('DataTable', ['id' => $id]))
    //     ->name('data.table');
});




require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
