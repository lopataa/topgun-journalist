# TopGun Journalist
This is a project for the TopGun course. It is a typescript program, that allows you to automatically write into journal even if you forget to.

## Disclaimer
This project is not intended to be used for cheating. __DO NOT USE IT__
This project is only for educational purposes.
This project also violates Terms of Service of the Discord. __Use it at your own risk__

## Features
- [x] Write into journal
- [x] Check if you have written into journal
- [x] Automatically write into journal using `node-schedule`

## How to use
1. Clone the repository
2. Install dependencies using `npm install`
3. Rename `.env.placeholder` to `.env` and fill it with your data
4. Run the program using `npm start`
5. Enjoy :)

## Use as a systemd service
1. Execute the steps 1-3 above
2. Edit the `WorkingDirectory` line in the `journalist.service` file to the folder you cloned into
3. Copy the `journalist.service` file to `/etc/systemd/system` (`cp journalist.service /etc/systemd/system/journalist.service`)
4. Reload the services with `sudo systemctl daemon-reload`
5. Enable the service with `sudo systemctl enable journalist.service`
6. Start the service with `sudo systemctl start journalist.service`
7. You can check the logs with `sudo systemctl status journalist.service`
