# 🎯 Guide d'Accessibilité - Médiflow

## Norme WCAG 2.1 - Zoom jusqu'à 200%

Ce guide assure que notre application reste lisible et fonctionnelle même avec un zoom/agrandissement de texte à 200%.

---

## 📏 Unités Scalables - Conversion px → rem

### Règle Fondamentale

- **1 rem = 16px** (valeur de base du navigateur)
- Utiliser **rem** pour les dimensions qui doivent scaler avec le zoom utilisateur
- Utiliser **em** pour les dimensions relatives aux éléments parents

```scss
// ❌ AVANT (Problématique)
padding: 20px; // Fixe, ne scale pas avec le zoom
margin: 10px; // Fixe

// ✅ APRÈS (Accessible)
padding: 1.25rem; // 20px ÷ 16 = 1.25rem
margin: 0.625rem; // 10px ÷ 16 = 0.625rem
```

### Conversion Rapide

| px  | rem    | Formule  |
| --- | ------ | -------- |
| 4   | 0.25   | 4 ÷ 16   |
| 8   | 0.5    | 8 ÷ 16   |
| 10  | 0.625  | 10 ÷ 16  |
| 12  | 0.75   | 12 ÷ 16  |
| 16  | 1      | 16 ÷ 16  |
| 20  | 1.25   | 20 ÷ 16  |
| 24  | 1.5    | 24 ÷ 16  |
| 30  | 1.875  | 30 ÷ 16  |
| 40  | 2.5    | 40 ÷ 16  |
| 70  | 4.375  | 70 ÷ 16  |
| 80  | 5      | 80 ÷ 16  |
| 120 | 7.5    | 120 ÷ 16 |
| 270 | 16.875 | 270 ÷ 16 |

---

## 🚫 Propriétés Problématiques - Éviter l'Overflow Hidden

### Le Problème

```scss
overflow: hidden;
```

Problèmes à 200% zoom:

- ❌ Masque le contenu débordant
- ❌ Empêche l'accès aux informations
- ❌ Brise la navigation
- ❌ Causes des scrollbars manquantes

### Solutions par Cas

#### 1️⃣ **Texte qui déborde (le plus courant)**

```scss
// ❌ AVANT
.text-container {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ✅ APRÈS
.text-container {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  // Permettre aux mots longs de se casser
}
```

#### 2️⃣ **Images/Contenu dans des conteneurs**

```scss
// ❌ AVANT
.card {
  overflow: hidden;
  border-radius: 8px;
}

// ✅ APRÈS
.card {
  overflow: auto; // Permet le scrolling si nécessaire
  border-radius: 0.5rem;
  max-height: auto; // Pas de limite de hauteur fixe
}
```

#### 3️⃣ **Avatars qui débordent**

```scss
// ❌ AVANT
.avatar {
  width: 120px;
  height: 120px;
  overflow: hidden;
}

// ✅ APRÈS
.avatar {
  width: 7.5rem; // 120px
  height: 7.5rem;
  overflow: hidden; // OK ici car conteneur carré !
  flex-shrink: 0; // Empêche la compression en flex
}
```

#### 4️⃣ **Conteneurs avec scrolling horizontal**

```scss
// ✅ CORRECT - Scrolling accessible
.horizontal-scroll {
  overflow-x: auto; // Permet le scroll horizontal
  overflow-y: hidden; // Pas de scroll vertical
  -webkit-overflow-scrolling: touch; // Smooth scrolling iOS
}
```

---

## 📐 Matrix de Conversion - Variables SCSS

### Layout Principal

```scss
// Desktop
$sidenav-desktop: 16.875rem; // 270px
$sidenav-mini: 5rem; // 80px
$header-height: 4.375rem; // 70px

// Spacing
$layout-padding: 1.25rem; // 20px
$card-spacer: 1.875rem; // 30px

// Border Radius
$border-radius: 1.125rem; // 18px

// Max Width
$boxedWidth: 75rem; // 1200px
```

---

## ✅ Checklist d'Accessibilité - Avant de Merger

- [ ] **Aucun px** dans les dimensions (margin, padding, font-size)
- [ ] Tout utilise **rem** ou **em**
- [ ] Pas d'**overflow: hidden** sauf sur avatars/images
- [ ] Test zoom 200% dans Chrome DevTools
  - Ctrl+Shift+M (DevTools) → ... → 200%
- [ ] Pas de **texte tronqué** à 200% zoom
- [ ] **Border-radius** en rem
- [ ] **Gaps et espacements** en rem
- [ ] **Media queries** appliquées correctement

---

## 🧪 Test d'Accessibilité 200%

### Mozilla Firefox

1. Ctrl + Shift + A → Accessibility Inspector
2. Zoom texte: Ctrl + + (jusqu'à 200%)
3. Zoom page: Ctrl + Shift + M

### Chrome DevTools

```
Ctrl+Shift+I → Console →
document.body.style.zoom = '2';  // 200% zoom
```

---

## 📋 Fichiers Clés à Migrer (Priorité)

1. **frontend/src/assets/scss/\_variables.scss** ⭐⭐⭐
2. **frontend/src/styles.scss** ⭐⭐⭐
3. **frontend/src/globals.css** ⭐⭐
4. **frontend/src/assets/scss/\_container.scss** ⭐⭐
5. Tous les **component.scss** individuels

---

## 🛠️ Utilisation des Mixins

```scss
@use "accessibility";

// Utiliser le mixin pour conversions sûres
@mixin rem($property, $value) {
  #{$property}: $value * 1rem / 16px;
}

// Exemple:
.button {
  @include rem(padding, 12px); // → 0.75rem
  @include rem(font-size, 16px); // → 1rem
}
```

---

## 📚 Ressources WCAG

- [WCAG 2.1 - Criterion 1.4.4 Resize text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- [MDN - CSS Length Units](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
- [rem vs em - CSS-Tricks](https://css-tricks.com/rem-em-understanding-units/)

---

## 🎓 Formation Développeurs

Tous les développeurs doivent:

1. Comprendre rem vs px
2. Tester zoom 200% régulièrement
3. Utiliser les mixins d'accessibilité
4. Vérifier pas d'overflow: hidden sans raison

---

_Dernière mise à jour: Avril 2026_
_Conforme à WCAG 2.1 Level AA_
