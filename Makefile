clean:
	rm -f tribe.zip

build: clean
	cd src; zip -r ../tribe.zip *
