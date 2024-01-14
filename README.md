# About this project

Epitome is a discord bot running on a Raspberry Pi to track RSS feeds, parse and filter them through chosen tags. It is meant to be used by different discord servers (guilds) and offer per-channel configurations. Epitome is written in Typescript upon the [discord.js](https://discord.js.org/#/) library.

## Background

This bot was developed in order to help feminist collectives gather & filter newspaper / media articles & stories in the process of giving true insights about sexism, feminicide and other forms of violence against women & gender minority groups. The process, if done manually, is tedious, time-consuming and emotionally draining. Collectives and activists using discord as a communication tool can now use this bot to automate some aspects of their watch work.

## Getting started

### Prerequisites

Create your own version of the bot by following the [Discord Developer Portal](https://discord.com/developers/applications) instructions. You should end up with a bot token and a client ID. Don't forget to add your bot to your server with a generated invitation link.

You will need [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/) installed on your machine.

### Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:sparky-raccoon/epitome.git
cd epitome
yarn install
```

Then, create a `.env` file at the root of the project and add the following environment variables:

```bash
TOKEN_DEV=your-bot-token
CLIENT_ID_DEV=your-client-id
```

### Usage

Run the following to deploy the slash commands and start the bot locally.

```bash
yarn deploy-command-dev
yarn dev
```

This will create a database.dev.sqlite file in the root of the project. You can use [DB Browser for SQLite](https://sqlitebrowser.org/) to open it and inspect the database.

You are now set up to test the bot locally.

### Deployment

The bot is meant to be deployed on a Raspberry Pi using Github Actions. The workflow file can be found in `.github/workflows/deploy.yml`. You will need to add the following secrets to your repository:

- `TOKEN` : your bot token
- `CLIENT_ID` : your client ID

The Raspberry Pi itself must be configured as a self-hosted runner to listen to code changes. It should have [pm2](https://pm2.keymetrics.io/) installed to run the bot as a service.
Please refer to the [Github Actions documentation](https://docs.github.com/en/actions/hosting-your-own-runners) for more information.

### Contribution

Epitome only speaks french but is open to **inclusive** translations. Feel free to open an issue or a pull request. Suggestions and feedback are also welcome.

### License

```
ANTI-CAPITALIST SOFTWARE LICENSE (v 1.4)

Copyright © 2024 andrea.saez@anicolyd.com

This is anti-capitalist software, released for free use by individuals and organizations that do not operate by capitalist principles.

Permission is hereby granted, free of charge, to any person or organization (the "User") obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, distribute, and/or sell copies of the Software, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or modified versions of the Software.

2. The User is one of the following:
   a. An individual person, laboring for themselves
   b. A non-profit organization
   c. An educational institution
   d. An organization that seeks shared profit for all of its members, and allows non-members to set the cost of their labor

3. If the User is an organization with owners, then all owners are workers and all workers are owners with equal equity and/or equal vote.

4. If the User is an organization, then the User is not law enforcement or military, or working for or under either.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT EXPRESS OR IMPLIED WARRANTY OF ANY KIND, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
