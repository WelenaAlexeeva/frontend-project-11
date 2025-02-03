install:
	npm ci
publish:
	npm publish --dry-run
lint:
	npx eslint .
lint-fix:
	npx eslint --fix .
video:
	asciinema rec demo.cast --overwrite
video-up:
	asciinema upload demo.cast
build:
	npm run build
server:
	npx webpack serve
# gendif
# 	node bin/gendiff.js
# test:
# 	npm test
# test-coverage:
# 	npm test -- --coverage --coverageProvider=v8

.PHONY: test
