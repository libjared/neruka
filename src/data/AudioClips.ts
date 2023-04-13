import vox15mtogo from "./assets/fifteen minutes to go.ogg";
import vox14 from "./assets/fourteen.ogg";
import vox13 from "./assets/thirteen.ogg";
import vox12 from "./assets/twelve.ogg";
import vox11 from "./assets/eleven.ogg";
import vox10 from "./assets/ten.ogg";
import vox09 from "./assets/nine.ogg";
import vox08 from "./assets/eight.ogg";
import vox07 from "./assets/seven.ogg";
import vox06 from "./assets/six.ogg";
import vox05 from "./assets/five.ogg";
import vox04 from "./assets/four.ogg";
import vox03 from "./assets/three.ogg";
import vox02 from "./assets/two.ogg";
import vox01 from "./assets/one.ogg";
import vox00 from "./assets/zero.ogg";
import voxTimeAway from "./assets/timeaway.ogg";
import vox01mrem from "./assets/one minutes remaining.ogg";
import vox30s from "./assets/thirty seconds.ogg";
import vox01htogo from "./assets/one hour to go.ogg";
import vox02htogo from "./assets/two hours to go.ogg";
import vox03htogo from "./assets/three hours to go.ogg";
import vox30mtogo from "./assets/thirty minutes to go.ogg";
// import quack from "./assets/quack.ogg";

// to generate a combined sound clip .OGG from a directory full of HL1's VOX .WAVs:
// cd vox
// mkdir -p ogg
// words="thirty seconds"; list=$(echo "$words" | tr ' ' '\n' | sed -r "s_(.*)_file '$PWD/\1.wav'_"); ffmpeg -f concat -safe 0 -i =(echo "$list") "./ogg/$words.ogg"

type AudioClip = { src: string };

const audioClips = {
  // three hours to go
  vox03htogo: { src: vox03htogo },
  // two hours to go
  vox02htogo: { src: vox02htogo },
  // one hour to go
  vox01htogo: { src: vox01htogo },
  // thirty minutes to go
  vox30mtogo: { src: vox30mtogo },
  // fifteen minutes to go
  vox15mtogo: { src: vox15mtogo },
  // fourteen
  vox14: { src: vox14 },
  // thirteen
  vox13: { src: vox13 },
  // twelve
  vox12: { src: vox12 },
  // eleven
  vox11: { src: vox11 },
  // ten
  vox10: { src: vox10 },
  // nine
  vox09: { src: vox09 },
  // eight
  vox08: { src: vox08 },
  // seven
  vox07: { src: vox07 },
  // six
  vox06: { src: vox06 },
  // five
  vox05: { src: vox05 },
  // four
  vox04: { src: vox04 },
  // three
  vox03: { src: vox03 },
  // two
  vox02: { src: vox02 },
  // one minutes remaining
  vox01mrem: { src: vox01mrem },
  // thirty seconds
  vox30s: { src: vox30s },
  // one
  vox01: { src: vox01 },
  // zero
  vox00: { src: vox00 },
  // time to get away from the computer and go to your room, good day
  voxTimeAway: { src: voxTimeAway },
};

export default audioClips;
export type { AudioClip };
