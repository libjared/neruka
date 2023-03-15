# Neruka

A web-based alarm app that audibly announces time remaining every so often, increasing in frequency the closer it gets to the end. Stop working past the end of your timebox!

## Development

- `yarn start` - Runs dev server on port 3000, watching for changes.
- `yarn test` - Runs tests, watching for changes.
- `yarn build` - Builds prod to `build/`.

## Roadmap to Release

- [x] Fix stop button
- [x] Click on countdown to stop and edit (requires state pullup)
- [x] Fix toHaveTextContent
- [x] Ceiling countdown
- [x] Display countups
- [x] Announce milestones
- [ ] Set target time directly
- [ ] Deploy
- [ ] Experiment with custom hooks
- [ ] Experiment with reducers
- [ ] Style hms labels
- [ ] Progress bar
