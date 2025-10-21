# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
# npm 发布包

## 1. 初始化包文件夹

切换到待发布包目录，npm 命令以当前路径为基准

```sh
npm init
```
## 2. 登录 npm 库

```sh
npm login

# cncc
npm login --registry https://artifact.srdcloud.cn/artifactory/api/npm/cncc_ip-snapshot-npm-local/

# inoe
npm login --registry https://artifact.srdcloud.cn/artifactory/api/npm/inoe-snapshot-npm-local
```

```username
wangt091
```
```password
AKCpBrvkMceDhMQ8sKzr8PiNY6WmUzEN9uXtTN3xHnuWiuvKvHDk341nc3tPHJzsqFu2Rx9Um
```
## 3. 发布

```sh
npm publish --access public

# cncc
npm publish --registry https://artifact.srdcloud.cn/artifactory/api/npm/cncc_ip-snapshot-npm-local/

# inoe
npm publish --registry https://artifact.srdcloud.cn/artifactory/api/npm/inoe-snapshot-npm-local
```

## 4. npm 删除(废弃)发布包或版本

### 删除 指定版本或包

```sh
# cncc
npm unpublish @tudan110/json-schema-editor-vue@0.0.17 --registry https://artifact.srdcloud.cn/artifactory/api/npm/cncc_ip-snapshot-npm-local

# inoe
npm unpublish @tudan110/json-schema-editor-vue@0.0.17 --registry https://artifact.srdcloud.cn/artifactory/api/npm/inoe-snapshot-npm-local
```

```sh
npm unpublish [<pkg>][@<version>] --force
```

直接强制删除指定包的指定版本，不需要 `cd` 进入包文件夹内，随处可以执行。
```sh
npm unpublish @tudan110/vue-demi-test@1.0.1 --force
```
直接强制删除指定包，不需要 `cd` 进入包文件夹内，随处可以执行。
```sh
npm unpublish @tudan110/vue-demi-test --force
```
需要 `cd` 进入包文件夹内，在执行该命令。
```sh
npm unpublish --force
```
它不会直接删除整个库包，只会删除当前项目 `package.json` 里面所配置的版本。
如果需要通过它删除整个库包，那么需要手动将当前库包已发布所有版本手动配置到 `package.json` 进行删除，每配置一个版本执行一下该命令进行移除，一直到所有版本号清空，`Packages` 里面就不会存在这个库包。

### 废弃指定版本或包

```sh
npm deprecate <pkg>[@<version>] <message>
```

```sh
## 例如
npm deprecate dzmtest '不在更新了'
npm deprecate dzmtest@1.0.1 '不在更新了'
```
	废弃的包除了安装时会有警示，并不影响使用。

## 参考资料

1. https://juejin.cn/post/6844904112153165832
2. https://juejin.cn/post/6950896466848137252
