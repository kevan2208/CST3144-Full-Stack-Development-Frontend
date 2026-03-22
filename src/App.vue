<script>
import {
  fetchLessons,
  fetchSearch,
  updateLessonSpace,
  postOrder
} from './api.js';

export default {
  name: 'App',
  data() {
    return {
      lessonList: [],
      cart: [],
      view: 'lessons',
      sortField: 'subject',
      sortDir: 'asc',
      searchQuery: '',
      searchTimer: null,
      loadError: '',
      actionError: '',
      checkoutName: '',
      checkoutPhone: '',
      checkoutSuccess: false,
      loadingLessons: false
    };
  },
  computed: {
    sortedLessons() {
      const field = this.sortField;
      const dir = this.sortDir;
      const list = [...this.lessonList];
      list.sort((a, b) => {
        let va = a[field];
        let vb = b[field];
        if (field === 'price' || field === 'space') {
          va = Number(va);
          vb = Number(vb);
        } else {
          va = String(va).toLowerCase();
          vb = String(vb).toLowerCase();
        }
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
      });
      return list;
    },
    cartButtonEnabled() {
      return this.cart.length > 0;
    },
    nameValid() {
      const n = this.checkoutName.trim();
      return /^[A-Za-z\s]+$/.test(n) && n.length > 0;
    },
    phoneValid() {
      const p = this.checkoutPhone;
      return /^\d+$/.test(p) && p.length > 0;
    },
    checkoutEnabled() {
      return this.nameValid && this.phoneValid;
    },
    nameError() {
      const n = this.checkoutName;
      if (n === '') return '';
      return this.nameValid ? '' : 'Use letters and spaces only.';
    },
    phoneError() {
      const p = this.checkoutPhone;
      if (p === '') return '';
      return this.phoneValid ? '' : 'Use numbers only.';
    }
  },
  mounted() {
    this.loadLessons();
  },
  methods: {
    lessonKey(lesson) {
      return String(lesson._id);
    },
    imageUrl(lesson) {
      const path = lesson.image || '';
      if (path.startsWith('http')) return path;
      const base = import.meta.env.VITE_API_BASE || '';
      return `${base}${path}`;
    },
    loadLessons() {
      this.loadingLessons = true;
      this.loadError = '';
      fetchLessons()
        .then((data) => {
          this.lessonList = data;
        })
        .catch((err) => {
          this.loadError = err.message || 'Could not load lessons.';
        })
        .finally(() => {
          this.loadingLessons = false;
        });
    },
    onSearchInput() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.runSearch();
      }, 350);
    },
    runSearch() {
      this.loadingLessons = true;
      this.loadError = '';
      const q = this.searchQuery.trim();
      const req = q === '' ? fetchLessons() : fetchSearch(q);
      req
        .then((data) => {
          this.lessonList = data;
        })
        .catch((err) => {
          this.loadError = err.message || 'Search failed.';
        })
        .finally(() => {
          this.loadingLessons = false;
        });
    },
    mergeLesson(updated) {
      const id = String(updated._id);
      this.lessonList = this.lessonList.map((l) =>
        String(l._id) === id ? { ...l, ...updated } : l
      );
    }
  }
};
</script>

<template>
  <div class="app">
    <p>App loading...</p>
  </div>
</template>
