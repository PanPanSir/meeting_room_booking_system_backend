
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "generateOptions": {
    "spec": false
  },
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "watchAssets": true,
    "assets": ["**/*.env"]
		// asssets 是指定 build 时复制的文件，watchAssets 是在 assets 变动之后自动重新复制。
  }
}
