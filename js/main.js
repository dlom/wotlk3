const TANK_MAX = 2;
const HEALER_MAX = 5;
const DPS_MAX = 18;

const state = {
	questsCompleted: 0,
	dungeonsCompleted: 0,
	raidsCompleted: 0,
	artifactPower: 0,
	tanks: 0,
	healers: 0,
	dps: 1,
};

const dungeonReady = "Journey through a deadly dungeon!";
const raidReady = "Join forces with other players to take down powerful bosses!"

const slots = [
	"helm", "helmet", "mask", "lens", "monocle", "cap", "headpiece", "crown", "circlet", "shroud", "cowl", "hood", "headband", "goggles", "coif", "headdress", "chapeau", "barbute",
	"amice", "spaulders", "pads", "pauldrons", "mantle", "monnions", "epaulets", "shoulder", "shoulderpads", "shoulderguards",
	"robes", "vest", "tunic", "armor", "wraps", "harness", "hauberk", "jerkin", "chain", "breastplate", "blouse", "chestpiece",
	"bindings", "armguards", "cuffs", "bracers", "vambraces", "wristguards", "bracelets",
	"gloves", "gauntlets", "mitts", "mittens",
	"belt", "girdle", "sash", "cinch", "cord",
	"chausses", "trousers", "breeches", "leggings", "kilt", "dungarees", "loincloth", "woollies", "pants", "britches",
	"boots", "walkers", "greaves", "footwraps", "sabatons", "slippers", "shoes", "stompers", "footpads",
	"amulet", "lei", "talisman", "medallion", "necklace", "charm", "choker", "chain", "pendant", "collar",
	"cape", "blanket", "cloak", "drape", "mantle",
	"ring", "band", "signet", "seal", "loop", "circle"
]
const setRandomArtifactName = (event) => {
	const slot = slots[Math.floor(Math.random() * slots.length)];
	event.target.textContent = `${slot.charAt(0).toUpperCase()}${slot.substring(1)}`
}

const addArtifactPower = (amount) => {
	const display = $("#artifact-power");
	const level = $("#artifact-level");
	const current = parseInt(display.textContent, 10);
	state.artifactPower = current + amount;
	display.textContent = `${state.artifactPower}`
	level.textContent = `${Math.ceil(Math.log(state.artifactPower)) + (state.artifactPower === 1 ? 1 : 0)}`
};

const gainItemLevel = (type) => {
	if (type === "dungeon") {
		state.dungeonsCompleted++;
	} else if (type === "raid") {
		state.raidsCompleted++;
	} else {
		state.questsCompleted++;
	}

	const questFactor = 200 * Math.tanh(state.questsCompleted / 22);
	const dungeonFactor = 300 * Math.tanh(state.dungeonsCompleted / 86);
	const raidFactor = 500 * Math.tanh(state.raidsCompleted / 60);

	const itemLevel = 3 * Math.tanh((questFactor + dungeonFactor + raidFactor) / 500) + 1;
	if (itemLevel >= 2) {
		$("#dungeon").disabled = false;
		$("#dungeon-info").textContent = dungeonReady;
	}
	if (itemLevel >= 2.5) {
		$("#raid").disabled = false;
		$("#raid-info").textContent = raidReady;
	}

	$("#item-level").textContent = (itemLevel * 1000).toFixed(2);
	return itemLevel;
};


const handleDungeon = () => {
	$("#dungeon-info").textContent = "Dungeoning...";
	setTimeout(() => {
		$("#dungeon-info").textContent = dungeonReady;

		const display = $("#artifact-level");
		const current = parseInt(display.textContent, 10) * 100 + 7;
		addArtifactPower(current);
		const ilvl = gainItemLevel("dungeon");

		$("#quest").disabled = false;
		$("#dungeon").disabled = false;
		$("#raid").disabled = (ilvl < 2.5);
	}, 500);
};

const handleRaid = () => {
	setTimeout(function tick() {
		if (state.tanks < TANK_MAX && Math.random() > 0.95) {
			state.tanks++;
		} else if (state.healers < HEALER_MAX && Math.random() > 0.9) {
			state.healers++;
		} else if (state.dps < DPS_MAX && Math.random() > 0.7) {
			state.dps++;
		}

		$("#raid-info").textContent = `Tanks: ${state.tanks}/${TANK_MAX} Healers: ${state.healers}/${HEALER_MAX} DPS: ${state.dps}/${DPS_MAX}`;
		if (state.tanks < TANK_MAX || state.healers < HEALER_MAX || state.dps < DPS_MAX) {
			setTimeout(tick, 100);
		} else {
			setTimeout(() => {
				$("#raid-info").textContent = "Raiding...";
				setTimeout(() => {
					$("#raid-info").textContent = raidReady;

					const display = $("#artifact-level");
					const current = parseInt(display.textContent, 10) * 100 + 7;
					addArtifactPower(current);
					gainItemLevel("raid");

					$("#quest").disabled = false;
					$("#dungeon").disabled = false;
					$("#raid").disabled = false;
				}, 1000);
			}, 500)
		}
	}, 100);
};

const main = async () => {
	$("#artifact-name").addEventListener("click", setRandomArtifactName);
	$("#artifact-name")._.fire("click")

	$$("input[type=radio]", $("#gender-selector"))._.addEventListener("change", (event) => {
		const value = event.target.value;

		if (value === "male") {
			$("#honorific").textContent = "m'lord"
		} else if (value === "female") {
			$("#honorific").textContent = "m'lady"
		} else {
			$("#honorific").textContent = "you"
		}
	});

	$("#quest").addEventListener("click", () => {
		const display = $("#artifact-level");
		const current = parseInt(display.textContent, 10);
		addArtifactPower(current);
		gainItemLevel("quest");
	});

	$("#dungeon").disabled = true;
	$("#dungeon").addEventListener("click", () => {
		$("#quest").disabled = true;
		$("#dungeon").disabled = true;
		$("#raid").disabled = true;

		Promise.resolve().then(handleDungeon)
	});

	$("#raid").disabled = true;
	$("#raid").addEventListener("click", () => {
		$("#quest").disabled = true;
		$("#dungeon").disabled = true;
		$("#raid").disabled = true;

		state.tanks = 0;
		state.healers = 0;
		state.dps = 1;

		Promise.resolve().then(handleRaid)
	});
};

$.ready().then(main);
