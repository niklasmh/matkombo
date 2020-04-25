import React, { useState, useEffect, useRef } from "react";
import {
  FirebaseAppProvider,
  useFirestoreCollectionData,
  useFirestore,
  useAnalytics,
  SuspenseWithPerf,
} from "reactfire";
import "./App.css";
import { foodCombinations as foodCombinationsLocal } from "./combinations";

const firebaseConfig = {
  apiKey: "AIzaSyBPXNPvR_quFgYLxwf3pPnvv_8PqTTQFLo",
  authDomain: "matkomboapp.firebaseapp.com",
  databaseURL: "https://matkomboapp.firebaseio.com",
  projectId: "matkomboapp",
  storageBucket: "matkomboapp.appspot.com",
  messagingSenderId: "354610688205",
  appId: "1:354610688205:web:196e74f763a2f9f9a2b984",
  measurementId: "G-PM9FLJS69L",
};

const localUpvotes = {};
const localDownvotes = {};

function App() {
  const appContainer = useRef(null);

  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <div className="App" ref={appContainer}>
        <h1 className="Title">Matkombo</h1>
        <SuspenseWithPerf
          fallback={
            <div className="Lists">
              <div className="Level">Henter matkombinasjoner ...</div>
            </div>
          }
          traceId={"load-combo-list"}
        >
          <Lists container={appContainer} />
        </SuspenseWithPerf>
      </div>
    </FirebaseAppProvider>
  );
}

export default App;

function Lists({ container }) {
  const [combo, setCombo] = useState([]);
  const [foodLists, setFoodLists] = useState([]);
  const [foodComboLists, setFoodComboLists] = useState([]);
  const [filters, setFilters] = useState([""]);

  useAnalytics();
  const increment = useFirestore.FieldValue.increment(1);
  const combosRef = useFirestore().collection("combos");
  const combos = useFirestoreCollectionData(combosRef, { idField: "combo" });

  function upvoteCombo(combo) {
    const comboRef = combosRef.doc(combo.sort().join(" + ").toLowerCase());
    comboRef.update({ upvotes: increment });
  }

  function downvoteCombo(combo) {
    const comboRef = combosRef.doc(combo.sort().join(" + ").toLowerCase());
    comboRef.update({ downvotes: increment });
  }

  useEffect(() => {
    if (!foodLists.length) {
      const foodCombinations = combos.map(
        ({
          combo,
          description = "",
          tags = "",
          upvotes = 0,
          downvotes = 0,
        }) => [
          {
            description,
            tags: tags.split(" ").filter((e) => !!e),
            upvotes,
            downvotes,
          },
          ...combo.split("+").map((e) => e.trim()),
        ]
      );
      const foods = foodCombinations
        .reduce(
          (acc, n) => [
            ...acc,
            ...n.filter((e) => typeof e === "string" && !acc.includes(e)),
          ],
          []
        )
        .sort();
      setFoodComboLists([foodCombinations]);
      setFoodLists([foods]);
    }
  }, [combos, foodLists]);

  function addCombination(combo, description = "", tags = "") {
    const distinctCombos = removeDuplicates(combo);
    if (distinctCombos.length > 1) {
      combosRef.doc(distinctCombos.sort().join(" + ").toLowerCase()).set(
        {
          ...(description && { description }),
          ...(tags && { tags }),
        },
        { merge: true }
      );
    } else {
      window.alert(
        "Du må ha flere forskjellige kombinasjoner. F.eks.: Is og sjokolade"
      );
    }
  }

  function removeDuplicates(array) {
    return [...new Set(array)];
  }

  // eslint-disable-next-line
  function updateDatabaseWithLocal() {
    foodCombinationsLocal.forEach(
      ([{ description = "", tags = [] }, ...comb]) => {
        addCombination(removeDuplicates(comb), description, tags.join(" "));
      }
    );
  }

  function downloadDatabaseContent() {
    const content = foodComboLists[0]
      .map(
        ([{ description = "", tags = [] }, ...combo]) =>
          combo.join(" + ") +
          (description || tags.length
            ? " = " + description + tags.map((tag) => " #" + tag).join("")
            : "")
      )
      .join("\n");
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", "matkombo.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <>
      <h2 className="Combo">
        {combo.map((c) => `"${c}"`).join(" og ") +
          (combo.length === 1 ? " og ..." : "")}
      </h2>
      <div className="Lists">
        {[...combo, "all"].map((_, i) => {
          return foodLists.length > i ? (
            <Level
              key={i}
              level={i}
              filters={filters}
              foodLists={foodLists}
              foodComboLists={foodComboLists}
              combo={combo}
              container={container}
              addCombination={addCombination}
              downloadDatabaseContent={downloadDatabaseContent}
              setCombo={setCombo}
              setFoodLists={setFoodLists}
              setFoodComboLists={setFoodComboLists}
              setFilters={setFilters}
              upvoteCombo={upvoteCombo}
              downvoteCombo={downvoteCombo}
            />
          ) : null;
        })}
      </div>
    </>
  );
}

function Level({
  level: i,
  filters,
  foodLists,
  foodComboLists,
  combo,
  container,
  addCombination,
  downloadDatabaseContent,
  setCombo,
  setFoodLists,
  setFoodComboLists,
  setFilters,
  upvoteCombo,
  downvoteCombo,
}) {
  const fieldRef = useRef(null);

  function getUserCombo(text, ifempty = "") {
    const answer = window.prompt(
      text + ' (Bruk "og" mellom hver kombinasjon for å kombinere flere)'
    );
    if (ifempty && answer === "") {
      window.alert(ifempty);
    }
    if (answer !== null) {
      const combo = answer
        .split(" og ")
        .map((a) => a.trim())
        .filter((a) => a);
      return [...new Set(combo)];
    }
    return null;
  }

  return (
    <div key={i} className="Level">
      <div className="InputContainer">
        <input
          ref={fieldRef}
          placeholder="Filtrer ..."
          value={filters[i]}
          onChange={(e) =>
            setFilters([
              ...filters.slice(0, i),
              e.target.value || "",
              ...filters.slice(i + 1),
            ])
          }
        />
        <button
          className={"Reset" + (filters[i] ? "" : " hidden")}
          onClick={() => {
            setFilters([...filters.slice(0, i), "", ...filters.slice(i + 1)]);
            fieldRef.current.focus();
          }}
        >
          ×
        </button>
      </div>
      <div className="List">
        {foodLists[i]
          .filter((food) => food.indexOf(filters[i].toLowerCase()) !== -1)
          .map((food) => (
            <div
              className={"Item" + (food === combo[i] ? " selected" : "")}
              key={food}
              onClick={() => {
                setCombo([...combo.slice(0, i), food]);
                setFilters([...filters.slice(0, i + 1), ""]);
                const availableFoodCombinations = foodComboLists[
                  i
                ].filter((fc) => fc.includes(food));
                setFoodComboLists([
                  ...foodComboLists.slice(0, i + 1),
                  availableFoodCombinations,
                ]);
                setFoodLists([
                  ...foodLists.slice(0, i + 1),
                  foodLists[i].filter(
                    (f) =>
                      f !== food &&
                      availableFoodCombinations.some((fc) => fc.includes(f))
                  ),
                ]);
                setTimeout(() => {
                  try {
                    if (container.current)
                      container.current.scrollLeft =
                        container.current.scrollWidth;
                  } catch (ex) {}
                }, 10);
              }}
            >
              <FoodItem
                level={i}
                food={food}
                combo={combo}
                foodComboList={foodComboLists[i]}
                upvoteCombo={upvoteCombo}
                downvoteCombo={downvoteCombo}
              />
            </div>
          ))}
        <div
          className="Item AddItem"
          onClick={() => {
            if (filters[i]) {
              if (i === 0) {
                const additionalAnswer = getUserCombo(
                  `Du må også kombinere "${filters[i]}" med noe annet:`,
                  "Du må ha flere kombinasjoner. F.eks.: Is og sjokolade"
                );
                if (additionalAnswer !== null && additionalAnswer.length) {
                  addCombination([...combo, filters[i], ...additionalAnswer]);
                }
              } else {
                addCombination([...combo, filters[i]]);
              }
            } else {
              const answer = getUserCombo(
                i === 0
                  ? "Sett navn på minst to matkombinasjoner som du mener kan kombineres:"
                  : `Sett navn på mat som du mener kan kombineres med "${combo.join(
                      '" og "'
                    )}":`,
                "Du må ha flere kombinasjoner. F.eks.: Is og sjokolade"
              );
              if (answer !== null && answer.length) {
                if (i === 0 && answer.length === 1) {
                  const additionalAnswer = getUserCombo(
                    `Du må minst kombinere med en til med "${answer[0]}":`,
                    "Du må ha flere kombinasjoner. F.eks.: Is og sjokolade"
                  );
                  if (additionalAnswer !== null && additionalAnswer.length)
                    addCombination([...combo, ...answer, ...additionalAnswer]);
                } else {
                  addCombination([...combo, ...answer]);
                }
              }
            }
          }}
        >
          + Legg til{" "}
          {filters[i] ? `"${filters[i].toLowerCase()}"` : "en ny kombinasjon"}
        </div>
        {i === 0 ? (
          <div
            className="Item AddItem"
            onClick={() => downloadDatabaseContent()}
          >
            Last ned alle kombinasjoner ↓
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FoodItem({
  level,
  food,
  combo,
  foodComboList,
  upvoteCombo,
  downvoteCombo,
}) {
  const comboArr = [...combo, food];
  const comboKey = comboArr.sort().join(" + ").toLowerCase();
  const [upvotes, setUpvotes] = useState(localUpvotes[comboKey] || 0);
  const [downvotes, setDownvotes] = useState(localDownvotes[comboKey] || 0);
  if (level === 0) {
    return <span className="more">{food}</span>;
  } else {
    const comboItems = foodComboList.filter((fc) => fc.includes(food));
    const comboItem = comboItems.find((c) => c.length - 2 === level);
    const existsMore = comboItems.some((c) => c.length - 2 > level);
    if (comboItem) {
      if (typeof comboItem[0] === "object") {
        return (
          <>
            <span className={existsMore ? "more" : ""}>{food}</span>
            <span className="Description">
              <span
                className="Vote up"
                onClick={(e) => {
                  e.stopPropagation();
                  upvoteCombo(comboArr);
                  if (comboKey in localUpvotes) {
                    localUpvotes[comboKey]++;
                  } else {
                    localUpvotes[comboKey] = 1;
                  }
                  setUpvotes((votes) => votes + 1);
                }}
              >
                {comboItem[0].upvotes + upvotes}
              </span>
              <span
                className="Vote down"
                onClick={(e) => {
                  e.stopPropagation();
                  downvoteCombo(comboArr);
                  if (comboKey in localDownvotes) {
                    localDownvotes[comboKey]++;
                  } else {
                    localDownvotes[comboKey] = 1;
                  }
                  setDownvotes((votes) => votes + 1);
                }}
              >
                {comboItem[0].downvotes + downvotes}
              </span>
              {comboItem[0].description ? (
                <>
                  {comboItem[0].description}
                  <br />
                </>
              ) : null}
              {(comboItem[0].tags || []).map((tag) => (
                <span key={tag} className="Tag">
                  {tag}
                </span>
              ))}
            </span>
          </>
        );
      }
      return <span className={existsMore ? "more" : ""}>{food}</span>;
    }
    return <span className={existsMore ? "more" : ""}>{food}</span>;
  }
}
