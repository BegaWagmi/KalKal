# 🚀 Development Guide - Rock Paper Scissors Maze Game

## 🏃‍♂️ Quick Start - Local Development

### Option 1: Using the Development Scripts (Recommended)

**Linux/Mac:**
```bash
./dev-server.sh
```

**Windows:**
```cmd
dev-server.bat
```

### Option 2: Using npm scripts
```bash
npm run dev
# or
npm start
```

### Option 3: Manual Python Server
```bash
python3 -m http.server 8000
# or
python -m http.server 8000
```

### Option 4: Using Node.js serve (if you have Node.js)
```bash
npx serve .
```

## 🌐 Access Your Game

Once the server is running, open your browser and navigate to:
**http://localhost:8000**

## 🐛 Debugging and Testing

### Console Logging
The game has comprehensive logging enabled. Open your browser's Developer Tools (F12) and check the Console tab to see:

- **Component Actions**: Every game action is logged with timestamps
- **State Changes**: Game state modifications are tracked
- **Error Details**: Full error context and stack traces
- **Debug Information**: Input/output data for key functions

### Debug Commands
Use these commands in the browser console for testing:

```javascript
// Show current player's keys
gameDebug.showKeys()

// Add a specific key to player
gameDebug.addKey('rock')    // 'rock', 'paper', or 'scissors'

// Show entire game state
gameDebug.showState()

// Reset the game completely
gameDebug.resetGame()
```

### Testing Checklist
- [ ] Game loads without errors
- [ ] Player movement works (WASD/Arrow keys)
- [ ] AI players move around the maze
- [ ] Keys can be collected
- [ ] Doors can be opened with correct keys
- [ ] Battle system triggers when players meet
- [ ] Rock-Paper-Scissors mechanics work
- [ ] UI updates correctly
- [ ] No console errors during gameplay

## 🚀 Deploy to GitHub Pages

### Automatic Deployment
1. Push your code to the `main` or `master` branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. Your game will be available at: `https://yourusername.github.io/your-repo-name`

### Manual Deployment
1. Go to your repository Settings
2. Navigate to Pages section
3. Set source to "GitHub Actions"
4. The workflow will handle the rest

### Custom Domain (Optional)
1. Add your custom domain in repository Settings > Pages
2. Configure DNS records as instructed
3. Your game will be available at your custom domain

## 🔧 Development Workflow

### 1. Local Development
```bash
# Start local server
./dev-server.sh

# Make changes to your code
# Test in browser at localhost:8000
# Check console for logs and errors
```

### 2. Testing and Debugging
- Use browser console for real-time debugging
- Check network tab for asset loading issues
- Use device simulation for mobile testing
- Test different screen sizes and orientations

### 3. Deployment
```bash
# Commit your changes
git add .
git commit -m "Your commit message"
git push origin main

# GitHub Actions will automatically deploy
# Check Actions tab for deployment status
```

## 📱 Testing on Different Devices

### Browser Testing
- **Chrome/Chromium**: Full support, best performance
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

### Mobile Testing
- Use browser dev tools device simulation
- Test touch controls (if implemented)
- Check responsive design
- Verify performance on mobile devices

### Cross-Platform Testing
- Test on Windows, macOS, and Linux
- Verify different screen resolutions
- Check browser compatibility

## 🐛 Common Issues and Solutions

### Game Won't Load
1. Check browser console for errors
2. Verify all JavaScript files are loading
3. Check network tab for failed requests
4. Ensure Phaser.js is properly loaded

### Performance Issues
1. Check frame rate in browser dev tools
2. Look for memory leaks in console logs
3. Verify asset sizes aren't too large
4. Check for infinite loops in game logic

### Multiplayer Issues
1. NetworkManager is currently placeholder
2. Check console for connection attempts
3. Verify server configuration
4. Check firewall/network settings

## 📊 Performance Monitoring

### Browser Dev Tools
- **Performance Tab**: Monitor frame rate and CPU usage
- **Memory Tab**: Check for memory leaks
- **Network Tab**: Monitor asset loading times
- **Console Tab**: Watch for performance warnings

### Game Metrics
- Target: 60 FPS
- Memory usage should remain stable
- Asset loading should be under 3 seconds
- No frame drops during gameplay

## 🔄 Continuous Integration

The GitHub Actions workflow automatically:
- Runs on every push to main/master
- Deploys to GitHub Pages
- Provides deployment status
- Handles build errors

## 📚 Next Steps

1. **Test the current implementation**
2. **Implement actual multiplayer networking**
3. **Add more game features**
4. **Optimize performance**
5. **Add sound effects and music**
6. **Implement save/load system**

## 🆘 Getting Help

- Check the console logs for detailed error information
- Review the comprehensive logging system
- Use debug commands to isolate issues
- Check browser compatibility
- Verify all dependencies are loaded

---

**Happy Coding! 🎮✨**