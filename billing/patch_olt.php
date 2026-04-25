<?php
$base = "d:/PROJECT/RT-RWNET_PAKAAM/billing";

// 1. Update Models
$oltModel = file_get_contents("$base/app/Models/Olt.php");
if(!str_contains($oltModel, "public function router")) {
    $oltModel = str_replace("}", "\n    public function router() {\n        return \$this->belongsTo(Router::class);\n    }\n}", $oltModel);
    file_put_contents("$base/app/Models/Olt.php", $oltModel);
}

// 2. Update Controller
$ctrl = file_get_contents("$base/app/Http/Controllers/OltController.php");
$ctrl = str_replace("use App\Models\{Olt, Region};", "use App\Models\{Olt, Region, Router};", $ctrl);
$ctrl = str_replace("[\"data\" => Olt::with(\"region\")->get()]", "[\"data\" => Olt::with([\"region\", \"router\"])->get()]", $ctrl);
$ctrl = str_replace("[\"regions\" => Region::all()]", "[\"regions\" => Region::all(), \"routers\" => Router::all()]", $ctrl);
$ctrl = str_replace("[\"data\" => \$olt, \"regions\" => Region::all()]", "[\"data\" => \$olt, \"regions\" => Region::all(), \"routers\" => Router::all()]", $ctrl);
file_put_contents("$base/app/Http/Controllers/OltController.php", $ctrl);

// 3. Update Views
$v_index = file_get_contents("$base/resources/views/olts/index.blade.php");
$v_index = str_replace("[{{ \$r->region->name ?? \"-\" }}]", "[{{ \$r->region->name ?? \"-\" }}] | Induk: ({{ \$r->router->name ?? \"Belum Ada Mikrotik\" }})", $v_index);
file_put_contents("$base/resources/views/olts/index.blade.php", $v_index);

$v_create = file_get_contents("$base/resources/views/olts/create.blade.php");
$v_create = str_replace("<br>\nNama:", " | Router/Mikrotik Induk: <select name=\"router_id\">@foreach(\$routers as \$rt)<option value=\"{{ \$rt->id }}\">{{ \$rt->name }} ({{ \$rt->host }})</option>@endforeach</select><br>\nNama:", $v_create);
file_put_contents("$base/resources/views/olts/create.blade.php", $v_create);

$v_edit = file_get_contents("$base/resources/views/olts/edit.blade.php");
$v_edit = str_replace("<br>\nNama:", " | Router/Mikrotik Induk: <select name=\"router_id\">@foreach(\$routers as \$rt)<option value=\"{{ \$rt->id }}\" {{ \$data->router_id == \$rt->id ? \"selected\" : \"\" }}>{{ \$rt->name }} ({{ \$rt->host }})</option>@endforeach</select><br>\nNama:", $v_edit);
file_put_contents("$base/resources/views/olts/edit.blade.php", $v_edit);

echo "OLT Patched Successfully!";

