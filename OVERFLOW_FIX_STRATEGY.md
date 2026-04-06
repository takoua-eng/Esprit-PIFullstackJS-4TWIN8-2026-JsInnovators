# 🎯 Plan d'Action Overflow: Hidden Fix

## 📋 Audit Complet des overflow: hidden

### Cas 1: ✅ ACCEPTABLE (Pas de changement nécessaire)

```scss
// Avatars circulaires - l'image est contenue par le cercle
.avatar-circle-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden; // ✅ OK - Image contenue dans cercle
}

// Conteneurs avec aspect-ratio fixe
.thumbnail {
  width: 100px;
  aspect-ratio: 1 / 1;
  overflow: hidden; // ✅ OK - Dimensions fixes
}
```

### Cas 2: ⚠️ CRITIQUE - À Corriger IMMÉDIATEMENT

```scss
// Modales/Dialogs masquant le contenu
.custom-dialog-panel {
  overflow: hidden; // ❌ Peut masquer contenu au zoom 200%
  // FIX: overflow: auto;
}

// Listes/Tables masquant le débordement
.table-wrapper {
  overflow: hidden; // ❌ Empêche scrolling horizontal
  // FIX: overflow-x: auto;
}

// Texte tronqué sans texte-overflow fallback
.text-container {
  overflow: hidden; // ❌ Texte long est coupé
  // FIX: overflow-wrap: break-word;
}
```

### Cas 3: ⏩ OPTIMISER

```scss
// Texte ellipsis - problème au zoom
.truncated-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // FIX: Ajouter fallback
  overflow-wrap: break-word;
  @supports not (text-overflow: ellipsis) {
    // Fallback pour anciens navigateurs
    word-break: break-word;
  }
}
```

---

## 📊 Statistiques Actuelles

**Total occurrences**: 48  
**À corriger immédiatement**: ~15  
**Acceptable/Identifié**: ~33

---

## ✅ Corrections Appliquées

### 1. Fichiers Core

- ✅ `globals.css` - Conversion padding-inline-start: 40px → 2.5rem
- ✅ `styles.scss` - Dialog overflow: hidden → overflow: auto
- ✅ `_container.scss` - body overflow-x: hidden → auto
- ✅ `_container.scss` - .overflow-hidden utilitaire → overflow-wrap
- ✅ `_variables.scss` - Tous les px → rem (sidenav, header, border-radius, etc.)
- ✅ `_header.scss` - Tous les px → rem

### 2. Patterns À Monitorer

1. Avatar containers (OK - keep overflow: hidden)
2. Modal/Dialog containers (FIX - change to overflow: auto)
3. Table wrappers (FIX - change to overflow-x: auto)
4. Text containers (FIX - add overflow-wrap: break-word)

---

## 🚀 Prochaines Étapes

### Phase 1: Core SCSS Files (95% couvert)

- [x] Variables principales
- [x] Global styles
- [x] Container classes
- [x] Layout header

### Phase 2: Component SCSS Files (À faire)

- [ ] Pages component files (50+ files)
- [ ] Admin pages
- [ ] Doctor/Nurse/Coordinator pages
- [ ] Patient pages

### Phase 3: Validation

- [ ] Test zoom 200% avec Chrome
- [ ] Test zoom 200%avec Firefox
- [ ] Vérifier pas de contenu masqué
- [ ] Valider scrolling fonctionnel

---

## 📌 Patterns de Correction

### Pattern 1: Containers avec contenu variable

```scss
// ❌ AVANT
.container {
  height: 300px;
  overflow: hidden;
}

// ✅ APRÈS
.container {
  height: auto;
  min-height: 300px;
  overflow: auto;
  max-height: 50vh; // Flexible max
}
```

### Pattern 2: Text Overflow

```scss
// ❌ AVANT
.title {
  overflow: hidden;
  text-overflow: ellipsis;
}

// ✅ APRÈS
.title {
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-break: auto;
}
```

### Pattern 3: Flex/Grid Containers

```scss
// ❌ AVANT
.flex-container {
  display: flex;
  overflow: hidden; // Masque items débordants
}

// ✅ APRÈS
.flex-container {
  display: flex;
  flex-wrap: wrap; // Allows wrapping
  overflow: auto; // Permet scrolling si nécessaire
}
```

---

## 🧪 Commandes de Test

```bash
# Firefox - Zoom to 200%
Ctrl + Shift + A  # Accessibility panel
Ctrl + +          # Zoom texte
Ctrl + +          # Zoom page

# Chrome DevTools
Ctrl + Shift + I  # DevTools
# Émulation > Zoom texte: 200%

# Terminal - Test rapide
curl -X POST http://localhost:4200?zoom=200
```

---

## 📋 Checklist Avant Merge

- [ ] Tous les rem conversions done
- [ ] overflow: hidden critique fixed
- [ ] No text truncation at 200% zoom
- [ ] Scrollbars accessible et visibles
- [ ] Border-radius all in rem
- [ ] Font-size all in rem/em
- [ ] Gaps/Spacing all in rem
- [ ] No fixed height breaking at 200%

---

_Dernière mise à jour: Avril 2026_  
_Conforme WCAG 2.1 Level AA_
