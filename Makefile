
test:
	@open http://localhost:8080/bundle
	@webpack-dev-server 'mocha!./test/test_index.js' --inline --hot --devtool eval

size:
	@webpack index.js bundle.js --json | analyze-bundle-size
	@webpack index.js reactive.js --output-library reactive --output-library-target umd
	@uglifyjs reactive.js > reactive.min.js
	@du -h reactive.min.js
	@gzip reactive.min.js
	@du -h reactive.min.js.gz
	@rm reactive.min.js.gz reactive.js

example:
	@open http://localhost:3000/example/index.html
	@gulp

test-karma:
	@./node_modules/.bin/karma start

test-coveralls:
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@node_modules/.bin/karma start --single-run && \
		cat ./coverage/lcov/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: test example
