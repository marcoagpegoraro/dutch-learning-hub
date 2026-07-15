export function PictureScene() {
  return (
    <figure className="picture-scene" role="img" aria-labelledby="picture-scene-caption">
      <figcaption id="picture-scene-caption" className="visually-hidden">
        A family prepares breakfast in a living room and kitchen. One adult pours coffee, another
        cuts bread, and a child feeds an orange cat. A dog sleeps on a rug. Apples and a blue cup
        are on the table, a red backpack is under a chair, a plant is beside the window, and outside
        it is raining beside a bicycle. The clock shows half past eight.
      </figcaption>
      <div className="scene-window" aria-hidden="true">
        <span>🌧️</span>
        <span className="scene-bike">🚲</span>
      </div>
      <div className="scene-clock" aria-hidden="true">
        8:30
      </div>
      <div className="scene-plant" aria-hidden="true">
        🪴
      </div>
      <div className="scene-table" aria-hidden="true">
        <span className="scene-food">🍞 🍎 🍎 ☕</span>
      </div>
      <div className="scene-person scene-person-one" aria-hidden="true">
        🧑‍🦱<small>☕</small>
      </div>
      <div className="scene-person scene-person-two" aria-hidden="true">
        👩<small>🔪🍞</small>
      </div>
      <div className="scene-child" aria-hidden="true">
        🧒<small>🥣</small>
      </div>
      <div className="scene-cat" aria-hidden="true">
        🐈
      </div>
      <div className="scene-dog" aria-hidden="true">
        🐕💤
      </div>
      <div className="scene-backpack" aria-hidden="true">
        🎒
      </div>
    </figure>
  );
}
