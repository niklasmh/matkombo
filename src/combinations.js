// Navn må være i entall (med mindre det blir veldig rart)
export const foodCombinations = `
appelsin + røbeter
avokado + kakao
avokado + sjokolade
avokado + vanilje
bacon + banan
banan + peanøtt
banan + sesam
bacon + sjokolade
blåmuggost + daddel
cola + kylling
druer + salami
eddik (sherry) + oliven (svart) + paprika (røkt)
eple (saus) + kylling
fetaost + kylling + villris
fisk + mango
gulrot + sukker
gulrot + honning
gurkemeie + ris
kirsebær + kylling
kylling + peanøtt
kylling + vaffel = Veldig godt!
laks + pesto
lapskaus + pølse
lapskaus + tyttebærsyltetøy
lapskaus + pølse + tyttebærsyltetøy
lapskaus + bringebærsyltetøy
lapskaus + fetaost
fiskepinner + pommes frites
fiskepinner + gulrot + potet
fiskepinner + gulrot + potet + smør = Yumm
fiskepinner + potet + smør
nutella + ost (myk)
salat + limesaft
salat + sitronsaft
ost + sjokolade
tomat + basilikum
røbeter + geiteost
gulrot + spisskum
blomkål + krydder
blomkål + ost
brokkoli + sitron
erter + minte
potet + rosmarin
potet + hvitløk
potet + persille
kål + bacon
kål + ost
avokado + chilli
avokado + bacon
sopp + hvitløk
sopp + timian
auberine + tomat
auberine + olivenolje
asparges + egg
persille + minte
lime + chilli
fisk + sitron
skalldyr + sitron
fisk + lime
skalldyr + lime
fisk + fennikel
fisk + dill
fisk + chilli + soya + ingefær
fisk + chips + eddik
salmon + røbet
fisk + kapers
fisk + safran
fisk + hvitvin
kjøtt + potet
biff + pepperot
biff + sennep
biff + kaffe
biff + blåmuggost
kylling + peanøtt
kylling + aprikos
kylling + hvitløk
svin + fennikel
svin + eple
lam + rosmarin
lam + artisjokk
lam + minte
kjøttpai + ketchup
bacon + egg
and + appelsin
skinke + ost
skinke + chutney + ost
blåmuggost + pære
ost + løk
ost + potet
ost + quince paste
ost + gressløk
geiteost + basilikum
rømme + gressløk
ricotta + salami
ost + sopp
eple + kanel
sjokolade + hasselnøtt
sjokolade + chilli
sjokolade + kaffe
honning + mandel
vanilje + egg
vanilje + krem
jordbær + krem
pære + bønner + bacon
appelsin + mandel
sjokolade + squash
ananas + minte = Sjukt #insane #nam
bjørnebær + eple
leverpostei + sylteagurk
leverpostei + sennep
makrell i tomat + agurk
brødskive + ost + jordbærsyltetøy
brødskive + ost + bringebærsyltetøy
brødskive + ost + syltetøy
brødskive + ost + ketchup
brødskive + brunost + sirup
brødskive + brunost + jordbærsyltetøy
brødskive + brunost + bringebærsyltetøy
brødskive + brunost + syltetøy
brødskive + brunost + syltetøy + banan
brødskive + brunost + leverpostei = #rart
brødskive + sjokolade + ost = Norwegia og sjokade
brødskive + peanøttsmør + appelsinmarmelade
brødskive + tomat + majones
brødskive + rømme + syltetøy
brødskive + kaviar + majones
brødskive + kaviar + banan
brødskive + kaviar + banan + chili-saus
pølse + vaffel
pølse + rekesalat
havregrøt + syltetøy
havregrøt + syltetøy + rosiner
mais + kesam
speltlumpe + skyr
riskaker + smørost + salt
potetstappe + tomatsuppe
potetstappe + tomatsuppe + makaroni
popkorn + sjokolade
makaroni + kanel + sukker
brunost + ost + salt = Rull sammen
agurk + aromat
krem + kanel
taco + brokkoli
taco + banan
pannekaker + ketchup
pommes frites + is = Dyppe pommes frites ned i is
brokkoli + kaviar
laks + kaviar
vaffel + kylling (fritert)
brus + peanøtter
cola + is = Is oppi Cola
nudler + rømme
makrell i tomat + ris + agurk + banan
vaffel + laks
`
  .split("\n")
  .filter((line) => !!line.trim())
  .map((line) => {
    const [combo, comment] = line.split("=");
    const parsedCombo = combo.split("+").map((f) => f.trim());
    if (comment) {
      const [description, ...tags] = comment.split(" #").map((f) => f.trim());
      return [{ description, tags }, ...parsedCombo];
    }
    return [{}, ...parsedCombo];
  });

export const foods = foodCombinations
  .reduce(
    (acc, n) => [
      ...acc,
      ...n.filter((e) => typeof e === "string" && !acc.includes(e)),
    ],
    []
  )
  .sort();
