# AI_PATTERNS.md — Reusable Code Patterns

> Patterns that WORK in this project. AI reuses these instead of reinventing.
> Grows as more code is written and audited.

---

## 🎯 Service Class Pattern

```php
// All services follow this return structure
class ExampleService
{
    public function doSomething(array $data): array
    {
        try {
            // logic here
            return [
                'success' => true,
                'data'    => $result,
                'message' => 'Operation successful'
            ];
        } catch (\Exception $e) {
            \Log::error('ExampleService::doSomething', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'data'    => null,
                'message' => $e->getMessage()
            ];
        }
    }
}
```

---

## 🔥 Livewire Component Pattern

```php
class ExampleComponent extends Component
{
    // Public properties = reactive
    public $items = [];
    public $search = '';
    public $isLoading = false;

    // Computed property for filtered data
    public function getFilteredItemsProperty()
    {
        return collect($this->items)->filter(
            fn($item) => str_contains(strtolower($item['name']), strtolower($this->search))
        );
    }

    // Always show loading state on async ops
    public function save()
    {
        $this->isLoading = true;
        
        $result = app(ExampleService::class)->doSomething($this->validate());
        
        if ($result['success']) {
            $this->dispatch('notify', type: 'success', message: $result['message']);
        } else {
            $this->dispatch('notify', type: 'error', message: $result['message']);
        }

        $this->isLoading = false;
    }

    public function render()
    {
        return view('livewire.example-component');
    }
}
```

---

## 🗄️ PostgreSQL Query Patterns

```php
// JSONB column query
Model::whereJsonContains('meta->tags', 'urgent')->get();

// Full text search (PostgreSQL native)
Model::whereRaw("to_tsvector('english', name) @@ plainto_tsquery(?)", [$search])->get();

// Efficient pagination with cursor
Model::orderBy('id')->cursorPaginate(20);
```

---

## 🛡️ Form Request Pattern

```php
class StoreExampleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('create', Example::class);
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:examples,email'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Nama wajib diisi',
            'email.unique'   => 'Email sudah digunakan',
        ];
    }
}
```

---

## 🔔 Notification Pattern

```php
// Trigger from Livewire
$this->dispatch('notify', type: 'success', message: 'Berhasil disimpan');
$this->dispatch('notify', type: 'error',   message: 'Terjadi kesalahan');
$this->dispatch('notify', type: 'warning', message: 'Perhatian!');
```

---

## 🧪 Testing Pattern

```php
// Feature test structure
public function test_example_works(): void
{
    $user = User::factory()->create(['role' => 'admin']);
    
    $response = $this->actingAs($user)
        ->postJson('/api/examples', [...])
        ->assertStatus(201)
        ->assertJsonStructure(['success', 'data', 'message']);
        
    $this->assertDatabaseHas('examples', [...]);
}
```

---

[AI adds new patterns here as they're discovered or established]
