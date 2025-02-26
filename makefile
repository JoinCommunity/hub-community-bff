start:
	yarn clean
	yarn
	yarn build
	pm2 start yarn --name conversa-de-garagem-bff -- run start

update:
	git pull
	yarn clean
	yarn
	yarn build
	pm2 restart conversa-de-garagem-bff