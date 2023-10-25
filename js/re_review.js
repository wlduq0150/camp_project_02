const reviewForm = document.getElementById("review-form");
const reviews = document.getElementById("reviews-list");

// Load reviews from local storage when the page loads
let storedReviews = loadReviewsFromLocalStorage();

const movieId = getMovieIdFromUrl();
let nextId = parseInt(localStorage.getItem("nextId")) || 1;

filterAndDisplayReviews(storedReviews, movieId);

reviewForm.addEventListener("submit", handleReviewSubmission);

async function handleReviewSubmission(e) {
  e.preventDefault();

  const nameInputValue = getInputValue("name");
  const reviewInputValue = getInputValue("review");
  const passwordInputValue = getInputValue("password");

  // 유효성 검사
  if (!commentValidationCheck(reviewInputValue)) {
    resetForm(reviewForm);
    return;
  }

  // Hash the user's password before storing it
  const hashedPassword = await hashPassword(passwordInputValue);

  nextId++;

  const newReviewData = {
    id: nextId,
    movieId: movieId,
    name: nameInputValue,
    reviewText: reviewInputValue,
    password: hashedPassword,
  };

  addNewReview(newReviewData);
  resetForm(reviewForm);
}

// 함수 정의

// 로컬 스토리지 가져오기
function loadReviewsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("reviews")) || [];
}

// 입력값 가져오기
function getInputValue(inputElementId) {
  return document.getElementById(inputElementId).value;
}

// url에서 영화 id 추출
function getMovieIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");
  return movieId;
}

// 새 리뷰 생성
function addNewReview(reviewData) {
  displayReview(reviewData);
  storedReviews.push(reviewData);
  localStorage.setItem("reviews", JSON.stringify(storedReviews));
  localStorage.setItem("nextId", nextId.toString());
}

// 리뷰 영화별 필터링
function filterAndDisplayReviews(reviews, movieId) {
  const filteredReviews = reviews.filter(
    (review) => review.movieId === movieId
  );

  for (const review of filteredReviews) {
    displayReview(review);
  }
}

// 비밀번호 hash 로직
async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    console.error("Error hashing password:", error);
    return null;
  }
}

// 리뷰 보여주기
function displayReview(reviewData) {
  const reviewElement = document.createElement("div");
  reviewElement.classList.add("user-review");
  reviewElement.innerHTML = `
    <strong>작성자:</strong> ${reviewData.name}<br>
    <strong>리뷰:</strong> <span class="review-text">${reviewData.reviewText}</span><br>
    <button class="delete-button">Delete</button>
    <button class="edit-button">Edit</button>
  `;

  // 삭제 버튼 정의
  const deleteButton = reviewElement.querySelector(".delete-button");

  // 삭제 버튼 이벤트
  deleteButton.addEventListener("click", () =>
    handleDeleteClick(reviewData, reviewElement)
  );

  // 수정 버튼 정의
  const editButton = reviewElement.querySelector(".edit-button");

  // 수정 버튼 이벤트
  editButton.addEventListener("click", () =>
    handleEditClick(reviewData, reviewElement)
  );

  reviews.appendChild(reviewElement);
}

// 리뷰 삭제
function removeReviewFromStorage(id) {
  let index = storedReviews.findIndex((review) => {
    return id === review.id;
  });
  if (index !== -1) {
    storedReviews.splice(index, 1);
    localStorage.setItem("reviews", JSON.stringify(storedReviews));
  }
}

// 리뷰 수정
function updateStoredReview(newText, id) {
  let index = storedReviews.findIndex((review) => {
    return id === review.id;
  });
  if (index !== -1) {
    storedReviews[index].reviewText = newText;
    localStorage.setItem("reviews", JSON.stringify(storedReviews));
  }
}

// 삭제 버튼 핸들러
async function handleDeleteClick(reviewData, reviewElement) {
  const enteredPassword = prompt("비밀번호를 입력하세요.");
  const enteredPasswordHash = await hashPassword(enteredPassword);

  // 취소 버튼을 누른 경우 처리
  if (enteredPassword === null) {
    return;
  }

  if (enteredPasswordHash === reviewData.password) {
    if (reviews.contains(reviewElement)) {
      reviews.removeChild(reviewElement);
    }
    removeReviewFromStorage(reviewData.id);
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

// 수정 버튼 핸들러
async function handleEditClick(reviewData, reviewElement) {
  const enteredPassword = prompt("비밀번호를 입력하세요.");
  const enteredPasswordHash = await hashPassword(enteredPassword);

  // 취소 버튼을 누른 경우 처리
  if (enteredPassword === null) {
    return;
  }

  if (enteredPasswordHash === reviewData.password) {
    let newReviewText = prompt("새로운 리뷰 내용을 입력하세요");

    // 유효성 검사
    if (!commentValidationCheck(newReviewText)) {
      alert("유효하지 않은 리뷰입니다.");
      return;
    }

    updateStoredReview(newReviewText, reviewData.id);

    let newTextElememt = reviewElement.querySelector(".review-text");
    newTextElememt.textContent = newReviewText;
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

// 초기화
function resetForm(formElement) {
  formElement.reset();
}