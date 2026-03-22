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
    },
    addToCart(lesson) {
      if (lesson.space <= 0) return;
      this.actionError = '';
      const newSpace = lesson.space - 1;
      updateLessonSpace(this.lessonKey(lesson), newSpace)
        .then((updated) => {
          this.mergeLesson(updated);
          this.cart.push({
            lessonId: this.lessonKey(lesson),
            subject: lesson.subject,
            location: lesson.location,
            price: lesson.price,
            image: lesson.image
          });
        })
        .catch((err) => {
          this.actionError = err.message || 'Could not update spaces.';
        });
    },
    removeFromCart(index) {
      const line = this.cart[index];
      if (!line) return;
      this.actionError = '';
      const current = this.lessonList.find((l) => String(l._id) === line.lessonId);
      const nextSpace = current ? current.space + 1 : 1;
      updateLessonSpace(line.lessonId, nextSpace)
        .then((updated) => {
          this.mergeLesson(updated);
          this.cart.splice(index, 1);
        })
        .catch((err) => {
          this.actionError = err.message || 'Could not restore space.';
        });
    },
    toggleCartView() {
      if (!this.cartButtonEnabled) return;
      this.view = this.view === 'lessons' ? 'cart' : 'lessons';
      if (this.view === 'lessons') {
        this.checkoutSuccess = false;
      }
    },
    goToLessons() {
      this.view = 'lessons';
      this.checkoutSuccess = false;
    },
    submitCheckout() {
      this.actionError = '';
      this.checkoutSuccess = false;
      if (!this.checkoutEnabled || this.cart.length === 0) return;
      const lessonIds = this.cart.map((c) => c.lessonId);
      const uniqueIds = [...new Set(lessonIds)];
      postOrder({
        name: this.checkoutName.trim(),
        phone: this.checkoutPhone,
        lessonIds
      })
        .then(() =>
          Promise.all(
            uniqueIds.map((id) => {
              const lesson = this.lessonList.find((l) => String(l._id) === id);
              const space = lesson ? lesson.space : 0;
              return updateLessonSpace(id, space);
            })
          )
        )
        .then((updatedLessons) => {
          updatedLessons.forEach((u) => this.mergeLesson(u));
          this.checkoutSuccess = true;
          this.cart = [];
          this.checkoutName = '';
          this.checkoutPhone = '';
        })
        .catch((err) => {
          this.actionError = err.message || 'Checkout failed.';
        });
    }
  }
};
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="brand">
        <h1>After-School Lessons</h1>
        <p class="tagline">Book activities for students</p>
      </div>
      <nav class="nav">
        <button type="button" class="btn ghost" @click="goToLessons">Lessons</button>
        <button
          type="button"
          class="btn primary"
          :disabled="!cartButtonEnabled"
          @click="toggleCartView"
        >
          Cart ({{ cart.length }})
        </button>
      </nav>
    </header>

    <main class="main">
      <p v-if="loadError" class="banner error">{{ loadError }}</p>
      <p v-if="actionError" class="banner error">{{ actionError }}</p>

      <section v-show="view === 'lessons'" class="panel">
        <div class="toolbar">
          <label class="field grow">
            <span>Search</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search as you type…"
              autocomplete="off"
              @input="onSearchInput"
            />
          </label>
          <label class="field">
            <span>Sort by</span>
            <select v-model="sortField">
              <option value="subject">Subject</option>
              <option value="location">Location</option>
              <option value="price">Price</option>
              <option value="space">Spaces</option>
            </select>
          </label>
          <label class="field">
            <span>Order</span>
            <select v-model="sortDir">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <p v-if="loadingLessons" class="muted">Loading…</p>

        <div class="grid">
          <article v-for="lesson in sortedLessons" :key="lessonKey(lesson)" class="card">
            <div class="card-media">
              <img :src="imageUrl(lesson)" :alt="lesson.subject" loading="lazy" />
            </div>
            <div class="card-body">
              <h2>{{ lesson.subject }}</h2>
              <p class="meta">{{ lesson.location }}</p>
              <p class="price">£{{ Number(lesson.price).toFixed(2) }}</p>
              <p class="spaces">{{ lesson.space }} spaces left</p>
              <button
                type="button"
                class="btn block"
                :disabled="lesson.space <= 0"
                @click="addToCart(lesson)"
              >
                Add to Cart
              </button>
            </div>
          </article>
        </div>
      </section>

      <section v-show="view === 'cart'" class="panel">
        <h2>Your cart</h2>
        <p v-if="cart.length === 0" class="muted">Your cart is empty.</p>
        <ul v-else class="cart-list">
          <li v-for="(line, index) in cart" :key="`${line.lessonId}-${index}`" class="cart-row">
            <img :src="imageUrl(line)" :alt="line.subject" class="thumb" />
            <div>
              <strong>{{ line.subject }}</strong>
              <div class="muted small">{{ line.location }} · £{{ Number(line.price).toFixed(2) }}</div>
            </div>
            <button type="button" class="btn danger" @click="removeFromCart(index)">Remove</button>
          </li>
        </ul>

        <div class="checkout">
          <h3>Checkout</h3>
          <div class="checkout-grid">
            <label class="field">
              <span>Name</span>
              <input v-model="checkoutName" type="text" autocomplete="name" />
              <span v-if="nameError" class="hint error">{{ nameError }}</span>
            </label>
            <label class="field">
              <span>Phone</span>
              <input v-model="checkoutPhone" type="tel" inputmode="numeric" autocomplete="tel" />
              <span v-if="phoneError" class="hint error">{{ phoneError }}</span>
            </label>
          </div>
          <button
            type="button"
            class="btn primary"
            :disabled="!checkoutEnabled || cart.length === 0"
            @click="submitCheckout"
          >
            Checkout
          </button>
          <p v-if="checkoutSuccess" class="banner success">
            Thank you — your booking was received.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
