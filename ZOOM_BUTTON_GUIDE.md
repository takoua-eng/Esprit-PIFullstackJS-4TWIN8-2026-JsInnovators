# 🔍 Zoom Control - WCAG 2.1 Accessibility Testing

## Vue d'Ensemble

Le **Zoom Control Button** est intégré dans le header de l'application et permet de tester l'accessibilité à différents niveaux de zoom, conformément à la norme **WCAG 2.1**.

---

## 📍 Localisation

**Header Position**: Dans la barre supérieure (topbar), entre le bouton d'alerte et le menu de profil
- Icon: 🔍 (Zoom In)
- Label: Percentage (100%, 125%, 150%, 175%, 200%)

```
[Menu] [Alerts] ........................... [🔍 100%] [Profile]
                                              ↑
                                         Zoom Button
```

---

## ✨ Fonctionnalités

### Niveaux de Zoom Disponibles
- **100%** - Taille normale (default)
- **125%** - +25% agrandissement
- **150%** - +50% agrandissement  
- **175%** - +75% agrandissement
- **200%** - +100% agrandissement (WCAG 2.1 test limit)

### Contrôles
1. **Menu Zoom**: Cliquer sur le bouton zoom pour ouvrir le menu
2. **Sélection Rapide**: Cliquer sur un niveau (100%, 125%, etc.)
3. **Boutons d'Action**:
   - **Reset** - Retour à 100%
   - **In** - Zoom +25% (jusqu'à 200%)
   - **Out** - Zoom -25% (jusqu'à 100%)

### Persistance
- Le niveau de zoom est **automatiquement sauvegardé** dans localStorage
- Le zoom est **restauré automatiquement** au prochain chargement

---

## 🚀 Utilisation

### **Pour les Développeurs**

#### 1. Tester l'Accessibilité
```
1. Ouvrir l'application
2. Cliquer sur le zoom button (🔍)
3. Sélectionner 200%
4. Vérifier que:
   - ✅ Tout le texte est lisible
   - ✅ Aucun contenu n'est caché (overflow: hidden)
   - ✅ Les boutons sont accessibles
   - ✅ Les scrollbars sont visibles
```

#### 2. Utiliser le ZoomService
```typescript
import { ZoomService } from 'src/app/services/zoom.service';

constructor(private zoomService: ZoomService) {}

// Obtenir le zoom actuel
const currentZoom = this.zoomService.getCurrentZoom();  // 100, 125, etc.

// Définir le zoom
this.zoomService.setZoom(150);

// Augmenter/Diminuer
this.zoomService.zoomIn();    // +25%
this.zoomService.zoomOut();   // -25%

// Réinitialiser
this.zoomService.resetZoom(); // → 100%

// Vérifier les limites
if (this.zoomService.canZoomIn()) { ... }
if (this.zoomService.canZoomOut()) { ... }

// Obtenir le ratio
const ratio = this.zoomService.getZoomRatio(); // 1.5 for 150%
```

#### 3. Écouter les Changements
```typescript
// Dans n'importe quel composant
ngOnInit() {
  window.addEventListener('zoom-changed', (event: CustomEvent) => {
    console.log('Nouveau zoom:', event.detail.level, '%');
    console.log('Ratio:', event.detail.ratio);
  });
}
```

---

## 📊 Architecture

### ZoomService (`app/services/zoom.service.ts`)
```
├─ Gère l'état du zoom (Signal Angular)
├─ Persiste dans localStorage
├─ Applique le CSS zoom à l'élément root
└─ Émet des événements custom
```

### ZoomControlComponent (`layouts/full/header/zoom-control.component.ts`)
```
├─ UI du bouton zoom
├─ Menu de sélection des niveaux
├─ Contrôles rapides (Reset, In, Out)
└─ Affichage du niveau actuel
```

### Intégration au Header
```
HeaderComponent
└─ Imports ZoomControlComponent
└─ Ajoute <app-zoom-control></app-zoom-control> au template
```

---

## 🎯 Checklist WCAG 2.1

### Avant de merger un composant
- [ ] Tester à 100% zoom - Normal
- [ ] Tester à 125% zoom - Pas de débordement
- [ ] Tester à 150% zoom - Texte lisible
- [ ] Tester à 175% zoom - Layout adapté
- [ ] **Tester à 200% zoom - CRITIQUE**
  - [ ] Aucun contenu masqué
  - [ ] Scrollbars visibles
  - [ ] Boutons accessibles
  - [ ] Pas d'éléments superposés

---

## 🐛 Dépannage

### "Le zoom ne fonctionne pas"
```
1. Vérifier que ZoomService est injecté correctement
2. Vérifier que le composant ZoomControl est importé dans Header
3. Vérifier la console pour les erreurs
4. Vérifier que localStorage n'est pas désactivé
```

### "Le zoom ne persiste pas entre les rechargements"
```
1. Vérifier que localStorage est activé
2. Vérifier les permissions du navigateur
3. Essayer une incognito window (pas de cache)
```

### "Les éléments se superposent au zoom 200%"
```
1. Vérifier qu'il n'y a pas de fixed positioning non-scalable
2. Vérifier que les z-index ne sont pas trop agressifs
3. Vérifier que max-width/max-height sont auto ou très larges
```

---

## 📱 Responsive Design

Le zoom button:
- ✅ **Desktop**: Visible dans le header topbar
- ✅ **Tablet**: Visible, peut être condensé
- ✅ **Mobile**: Peut être caché si pas de place (utiliser toggle si nécessaire)

---

## 🧪 Test WCAG AAA

Pour une conformité **WCAG AAA** supplémentaire:
1. Utiliser le zoom à 200% (WCAG 2.1 AA minimum)
2. Tester avec des lecteurs d'écran
3. Tester avec clavier uniquement (Tab, Enter, Arrows)
4. Vérifier le contrast ratio (4.5:1 pour le texte)

---

## 📚 Ressources

- [WCAG 2.1 - Resize Text (1.4.4)](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- [ZoomService Documentation](./src/app/services/zoom.service.ts)
- [Accessibility Guide](../../ACCESSIBILITY_GUIDE.md)

---

## 🎓 Cas d'Usage Recommandés

### 1. **Test Rapide d'Accessibilité**
```
Avant de déployer → Tester à 200% zoom
→ Vérifier absence d'éléments cachés
```

### 2. **Validation de Composant**
```
Créer composant → Zoom à 150-200%
→ Vérifier lisibilité → Merger
```

### 3. **Debug d'Overflow**
```
Problème d'affichage → Zoom à 200%
→ Identifier overflow: hidden
→ Corriger avec overflow-wrap ou overflow: auto
```

---

## 💾 Stockage localStorage

**Clé**: `app-zoom-level`  
**Valeurs possibles**: 100, 125, 150, 175, 200  
**Valeur par défaut**: 100

```typescript
// Accès direct (rare)
const savedZoom = localStorage.getItem('app-zoom-level');
localStorage.setItem('app-zoom-level', '150');
localStorage.removeItem('app-zoom-level'); // Reset
```

---

## ✅ Vérification Finale

Après implémentation, vérifier:
- [x] Zoom button visible dans le header
- [x] Tous les 5 niveaux (100-200%) fonctionnent
- [x] Boutons Reset, In, Out fonctionnent
- [x] Zoom persiste après rechargement de page
- [x] Application reste fonctionnelle à 200% zoom
- [x] Pas d'erreurs dans la console

---

**Créé**: Avril 5, 2026  
**Norme**: WCAG 2.1 Level AA ✅  
**Status**: ✅ Implémenté et Testé

