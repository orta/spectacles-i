({
	enter: function(map, world)
	{
		new Scenario()
			.overrideBGM("Bruce tells his story")
			.pause(1000)
			.talk("Bruce", 1.0,
				"I tried so hard to make him understand, but for so long, he refused to listen...",
				"So many times I said to myself, \"Bruce, why do you even bother?\" Anything to prove to myself that I wasn't the one at fault--that the reason he wouldn't listen was because of his own denial, not because I was pushing far too hard...",
				"I was so intent on convincing him of Spellbinder's dishonesty that I didn't step back to take a look at the bigger picture. I refused to. And in the end, I wasn't the one hurt by it.")
			.pause(2000)
			.talk("Bruce", 1.0, "He was.")
			.fadeBGM(0.0, 5.0)
			.pause(1000)
			.run();
	}
})