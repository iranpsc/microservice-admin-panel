<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReplaceImagesUrlSeeder extends Seeder
{
    private const OLD_URL = 'https://admin.rgb.irpsc.com';

    private const NEW_URL = 'https://admin.metarang.com';

    /**
     * Replace old admin URL with new one in images.url column.
     */
    public function run(): void
    {
        $updated = DB::table('images')
            ->where('url', 'like', '%' . self::OLD_URL . '%')
            ->update([
                'url' => DB::raw(
                    "REPLACE(url, '" . self::OLD_URL . "', '" . self::NEW_URL . "')"
                ),
            ]);

        $this->command->info("Updated {$updated} image URL(s).");
    }
}
