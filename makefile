start:
	yarn clean
	yarn
	yarn build
	pm2 start yarn --name hub-community-bff -- run start

update:
	git pull
	yarn clean
	yarn
	yarn build
	pm2 restart hub-community-bff