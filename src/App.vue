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
  methods: {}
};
</script>

<template>
  <div class="app">
    <p>App loading...</p>
  </div>
</template>
