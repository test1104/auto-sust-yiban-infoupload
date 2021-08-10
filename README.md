# auto-sust-yiban-infoupload

## Requirement

- [Node.js](https://nodejs.org/) >= 16.0.0

## Usage

```bash
git clone https://github.com/ShirasawaSama/auto-sust-yiban-infoupload.git

cd auto-sust-yiban-infoupload

npm install --production
```

### Build

```bash
npm build
```

### Cli

```bash
node dist/cli <mobile> <password> --kind=[morning/noon/vacation] --location=[location] --temperature=[temperature]
```

#### Example

```bash
node dist/cli 123456789010 iLoveYou -k noon

node dist/cli 123456789010 iLoveYou -t 36.4
```

### Server

#### Run

```bash
echo 你的腾讯位置服务Key>lbs_key
```

##### Simple

```bash
npm start
```

##### pm2

```bash
npm install -g pm2

pm2 run main.js
```

##### Docker

```bash
docker build -t auto-sust-yiban-infoupload .

docker run -d auto-sust-yiban-infoupload
```

#### Status

Just open `http://127.0.0.1:47357/`

#### Whitelist

Edit `config.json`:

```json
{
  "phone number1": {
    "password": "your password",
    "location": "your location"
  }
}
```

##### Example

```json
{
  "12345678910": { "password": "iLoveYou" },
  "12345678911": { "password": "iHateYou" }
}
```

Then restart the application.

### Github Actions

1. Fork this repository
2. Add these following secrets:
  - **YIBAN_MOBILE**: Your phone number
  - **YIBAN_PASSWORD**: Your password
  - **YIBAN_LOCATION**: Your location _(Optional)_

## Author

Shirasawa

## License

[MIT](./LICENSE)
