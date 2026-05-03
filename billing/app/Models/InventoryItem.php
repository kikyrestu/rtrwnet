<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $guarded = [];

    protected $casts = [
        'unit_price' => 'decimal:2',
    ];

    protected $appends = ['is_low_stock'];

    public function category()
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'item_id');
    }

    /**
     * Check if item stock is at or below minimum threshold.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->quantity <= $this->min_stock;
    }
}
