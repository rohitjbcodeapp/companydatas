<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveMappingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'mappings' => 'required|array',
            'mappings.*.source_column' => 'nullable|string',
            'mappings.*.target_column' => 'nullable|string',
            'mappings.*.is_selected' => 'boolean',
            'mappings.*.column_order' => 'integer',
        ];
    }
}
