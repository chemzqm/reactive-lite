example:
	@open http://localhost:3000/example/index.html
	@gulp

dev:
	@open http://localhost:8080/bundle
	@webpack-dev-server 'mocha!./test/test.js' --inline --hot --module-bind html

test:
	@./node_modules/.bin/karma start

test-coveralls:
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@node_modules/.bin/karma start --single-run && \
		cat ./coverage/lcov/lcov.info | ./node_modules/coveralls/bin/coveralls.js

doc:
	@ghp-import example -n -p

.PHONY: test example
