<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;

class InventoryController extends Controller
{
    // ==================== CATEGORIES ====================

    public function categoryIndex()
    {
        return response()->json(
            InventoryCategory::withCount('items')->get()
        );
    }

    public function categoryStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $category = InventoryCategory::create($request->all());
        return response()->json($category, 201);
    }

    public function categoryUpdate(Request $request, InventoryCategory $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
        ]);

        $category->update($request->all());
        return response()->json($category);
    }

    public function categoryDestroy(InventoryCategory $category)
    {
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }

    // ==================== ITEMS ====================

    public function itemIndex(Request $request)
    {
        $query = InventoryItem::with('category');

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('low_stock') && $request->low_stock === 'true') {
            $query->whereColumn('quantity', '<=', 'min_stock');
        }
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function itemStore(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:inventory_categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'quantity' => 'integer|min:0',
            'min_stock' => 'integer|min:0',
            'unit_price' => 'numeric|min:0',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $item = InventoryItem::create($request->all());

        // Record initial stock if quantity > 0
        if ($item->quantity > 0) {
            InventoryTransaction::create([
                'item_id' => $item->id,
                'type' => 'in',
                'quantity' => $item->quantity,
                'reference' => 'Stok awal',
                'performed_by' => auth()->id(),
            ]);
        }

        return response()->json($item->load('category'), 201);
    }

    public function itemShow(InventoryItem $item)
    {
        return response()->json(
            $item->load(['category', 'transactions.performer'])
        );
    }

    public function itemUpdate(Request $request, InventoryItem $item)
    {
        $request->validate([
            'category_id' => 'required|exists:inventory_categories,id',
            'name' => 'required|string|max:255',
            'min_stock' => 'integer|min:0',
            'unit_price' => 'numeric|min:0',
        ]);

        $item->update($request->only(['category_id', 'name', 'sku', 'min_stock', 'unit_price', 'location', 'notes']));
        return response()->json($item->load('category'));
    }

    public function itemDestroy(InventoryItem $item)
    {
        $item->delete();
        return response()->json(['message' => 'Item berhasil dihapus.']);
    }

    // ==================== STOCK TRANSACTIONS ====================

    public function stockIn(Request $request, InventoryItem $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $item->increment('quantity', $request->quantity);

        InventoryTransaction::create([
            'item_id' => $item->id,
            'type' => 'in',
            'quantity' => $request->quantity,
            'reference' => $request->reference,
            'performed_by' => auth()->id(),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => "Stok masuk {$request->quantity} berhasil dicatat.",
            'item' => $item->fresh()->load('category'),
        ]);
    }

    public function stockOut(Request $request, InventoryItem $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($item->quantity < $request->quantity) {
            return response()->json([
                'message' => "Stok tidak cukup. Tersedia: {$item->quantity}",
            ], 400);
        }

        $item->decrement('quantity', $request->quantity);

        InventoryTransaction::create([
            'item_id' => $item->id,
            'type' => 'out',
            'quantity' => $request->quantity,
            'reference' => $request->reference,
            'performed_by' => auth()->id(),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => "Stok keluar {$request->quantity} berhasil dicatat.",
            'item' => $item->fresh()->load('category'),
        ]);
    }

    public function itemTransactions(InventoryItem $item)
    {
        return response()->json(
            $item->transactions()->with('performer')->latest()->get()
        );
    }

    // ==================== SUMMARY ====================

    public function summary()
    {
        $totalItems = InventoryItem::count();
        $totalValue = InventoryItem::selectRaw('SUM(quantity * unit_price) as total')->value('total') ?? 0;
        $lowStockCount = InventoryItem::whereColumn('quantity', '<=', 'min_stock')->count();
        $recentTransactions = InventoryTransaction::with(['item.category', 'performer'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'total_items' => $totalItems,
            'total_value' => (float) $totalValue,
            'low_stock_count' => $lowStockCount,
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
