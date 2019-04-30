# Ciscospark A/V Toggle Issue Repro:


### Start Server

```bash
yarn
# - or -
# npm install
yarn start
# - or -
# npm run start
```

Navigate to localhost:3333 in a browser

### Repro

- Enter your developer access token and click connect
- Enter your webex SIP address and click "Start Or Join Meeting"

From the webex teams desktop application (using a different account), dial
the SIP address used above. Then in the browser start muting and unmuting
video.

Expected:
>Toggles work as expected and desktop app appropriately shows the browser
client muting and unmuting video

Actual:
>Browser shows local stream freezing and resuming, but desktop app eventually
gets stuck in only muted state. Sometimes this occurs on first toggle and
sometimes it takes a few tries.

**Note:**
Watching logs in the devtools console, it seems like locus eventually gets
stuck expecting a different direction and is unable to recover.