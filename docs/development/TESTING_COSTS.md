# Testing Costs Documentation

## Google Cloud Text-to-Speech Testing Costs

### Cost Breakdown

**Google Cloud TTS Pricing:**

- **Standard voices**: $4 per 1 million characters
- **Neural2 voices**: $16 per 1 million characters (we use these for quality)

### Our Test Script Costs

**Basic Test** (`bun run test:tts`):

- **Basic synthesis**: ~200 characters = $0.0032 (Neural2 voices)
- **Conversational test**: ~500 characters = $0.008 (Neural2 voices)
- **Total estimated cost**: ~$0.011 (approximately **1 cent**)

### Test Commands

```bash
# 1. FREE - Validate setup without API calls
bun run test:tts:dry

# 2. COSTS ~$0.01 - Full integration test with actual audio generation
bun run test:tts

# 3. FREE - Unit tests for cost optimization logic
bun test
```

### What the Tests Do

#### Dry Run Test (FREE)

- ✅ Validates Google Cloud credentials
- ✅ Checks service account permissions
- ✅ Tests service instantiation
- ✅ Verifies voice configurations
- ✅ Shows cost estimates
- ❌ No actual API calls

#### Full Test (~$0.01)

- ✅ Everything from dry run, plus:
- 🔊 Generates actual audio files
- 🔊 Tests basic TTS synthesis
- 🔊 Tests conversational dialogue generation
- 🔊 Creates multiple voice segments
- 💰 Costs approximately 1 cent

### Cost Safety Features

1. **Budget limits**: $5/day, $100/month configured
2. **Cost tracking**: Every API call tracked and logged
3. **Estimation**: Costs calculated before API calls
4. **Caching**: Duplicate content cached to avoid repeat costs

### Example Output

After running `bun run test:tts`, you'll get:

- `test-basic-tts.mp3` - Single voice test
- `test-conversation-host_a-*.mp3` - Host A segments
- `test-conversation-host_b-*.mp3` - Host B segments
- Cost summary showing exact spend

### First-Time Setup Checklist

1. **Run dry test first**: `bun run test:tts:dry`
2. **Verify all checks pass** before spending money
3. **Confirm Google Cloud billing** is enabled
4. **Check quotas** in Google Cloud Console
5. **Run full test**: `bun run test:tts` (costs ~$0.01)

### Production Cost Estimates

**Per Episode (optimized configuration):**

- **Summarization**: $0.01 (GPT-4o-mini)
- **TTS**: $0.05 (Google Cloud Neural2)
- **Total per episode**: ~$0.06

**Monthly estimates (30 episodes):**

- **Current optimized**: ~$1.80/month
- **Before optimization**: ~$15/month
- **Savings**: 88% cost reduction

### Troubleshooting

If costs seem high:

1. Check character count in generated content
2. Verify Neural2 vs Standard voice usage
3. Review caching configuration
4. Check for duplicate API calls

**Emergency stop**: Disable APIs in Google Cloud Console if needed.
