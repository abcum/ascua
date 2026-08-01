# Copyright © 2016 Abcum Ltd
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

default:
	@echo "Choose a Makefile target:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print "  - " $$1}}' | sort

.PHONY: clean
clean:
	@echo "Clean..."
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.bowerrc' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.editorconfig' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.ember-cli' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.ember-cli.js' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.eslintignore' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.eslintrc.js' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f-name '.gitignore' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.gitkeep' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.template-lintrc.js' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.travis.yml' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.watchmanconfig' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name '.bowerrc' -delete \;
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name 'ember-cli-build.js' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name 'jsconfig.json' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name 'package-lock.json' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name 'README.md' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name 'testem.js' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -exec find {} -type f -name 'yarn.lock' -delete
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -name '.git' -exec rm -rf "{}" \;
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -name 'config' -exec rm -rf "{}" \;
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -name 'dist' -exec rm -rf "{}" \;
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -name 'tests' -exec rm -rf "{}" \;
	find packages -mindepth 2 -maxdepth 2 -type d ! -path 'packages/surrealdb' -name 'tmp' -exec rm -rf "{}" \;
	rm -rf node_modules
	npx lerna clean --yes

.PHONY: setup
setup:
	@echo "Setup..."
	npm install

.PHONY: serve
serve:
	@echo "Serve..."
	FASTBOOT_DISABLED=true ember serve

.PHONY: version
version:
	@echo "Version..."
	npx lerna@4.0.0 version --no-push --force-publish

.PHONY: publish
publish:
	@echo "Publish..."
	npx lerna@4.0.0 publish from-package

.PHONY: deploy
deploy:
	@echo "Deploy..."
	rm -rf /tmp/ascua-deploy
	ember deploy production
