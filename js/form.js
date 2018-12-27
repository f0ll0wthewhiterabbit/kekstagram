'use strict';

(function () {
	var PIN_INITIAL_VALUE = 100;
	var EFFECT_LEVEL_INPUT_INITIAL_VALUE = 100;
	var MAX_HASH_TAG_LENGTH = 20;
	var MAX_HASH_TAGS_AMOUNT = 5;
	var HashTagErrorMessage = {
		TOO_BIG_QUANTITY: 'Количество хеш-тегов не должно быть больше пяти',
		HAVE_DUPLICATES: 'Один и тот же хэш-тег не может быть использован дважды',
		NOT_BEGINS_WITH_HASH: 'Каждый хеш-тег должен начинаться с символа #',
		NO_CONTENT_AFTER_HASH: 'Хеш-тег не может состоять только из одной #',
		TOO_LONG: 'Максимальная длина одного хэш-тега 20 символов, включая #',
		NOT_SEPARATED_WITH_SPACE: 'Хэш-теги должны быть разделены пробелами'
	};

	var uploadForm = document.querySelector('.img-upload__form');
	var uploadFileInput = uploadForm.querySelector('#upload-file');
	var uploadFilePopup = uploadForm.querySelector('.img-upload__overlay');
	var imageUploadClose = uploadFilePopup.querySelector('.img-upload__cancel');
	var effectLevelSlider = uploadFilePopup.querySelector('.effect-level');
	var effectLevelPin = uploadFilePopup.querySelector('.effect-level__pin');
	var effectLevelDepth = uploadFilePopup.querySelector('.effect-level__depth');
	var effectLevelInput = uploadFilePopup.querySelector('.effect-level__value');
	var effectsList = uploadFilePopup.querySelector('.effects__list');
	var effectNone = effectsList.querySelector('#effect-none');
	var previewImage = uploadFilePopup.querySelector('.img-upload__preview img');
	var previewImageWrapper = uploadFilePopup.querySelector('.img-upload__preview');
	var hashTagsInput = uploadFilePopup.querySelector('.text__hashtags');
	var commentInput = uploadFilePopup.querySelector('.text__description');

	var uploadFilePopupEscPressHandler = function (evt) {
		if (evt.target.className !== 'text__hashtags' && evt.target.className !== 'text__description') {
			window.util.isEscEvent(evt, closeUploadFilePopup);
		}
	};

	var openUploadFilePopup = function () {
		effectLevelSlider.classList.add('hidden');
		window.scalePhoto.activate();
		uploadFilePopup.classList.remove('hidden');
		document.addEventListener('keydown', uploadFilePopupEscPressHandler);
	};

	var resetInputData = function () {
		uploadFileInput.value = '';
		hashTagsInput.value = '';
		commentInput.value = '';
		previewImage.className = 'effects__preview--none';
		previewImageWrapper.style.filter = '';
		effectLevelInput.value = 100;
		effectNone.checked = true;
	};

	var closeUploadFilePopup = function () {
		uploadFilePopup.classList.add('hidden');
		resetInputData();
		window.scalePhoto.deactivate();
		document.removeEventListener('keydown', uploadFilePopupEscPressHandler);
	};

	uploadFileInput.addEventListener('change', function () {
		openUploadFilePopup();
	});

	imageUploadClose.addEventListener('click', function () {
		closeUploadFilePopup();
	});

	var setPinPosition = function (pinPosition) {
		if (pinPosition < 0 || pinPosition > 100) {
			return;
		}

		effectLevelPin.style.left = pinPosition + '%';
		effectLevelDepth.style.width = pinPosition + '%';
		effectLevelInput.value = Math.round(pinPosition);
	};

	var setEffectLevel = function () {
		switch (previewImage.className) {
			case 'effects__preview--chrome':
				previewImage.style.filter = 'grayscale(' + effectLevelInput.value / 100 + ')';
				break;
			case 'effects__preview--sepia':
				previewImage.style.filter = 'sepia(' + effectLevelInput.value / 100 + ')';
				break;
			case 'effects__preview--marvin':
				previewImage.style.filter = 'invert(' + effectLevelInput.value + '%)';
				break;
			case 'effects__preview--phobos':
				previewImage.style.filter = 'blur(' + effectLevelInput.value / 100 * 3 + 'px)';
				break;
			case 'effects__preview--heat':
				previewImage.style.filter = 'brightness(' + ((effectLevelInput.value / 100 * 2) + 1) + ')';
				break;

			default:
				previewImage.style.filter = '';
				break;
		}
	};

	var effectLevelPinMouseDownHandler = function (evt) {
		evt.preventDefault();

		var startCoordX = evt.clientX;

		var mouseMoveHandler = function (moveEvt) {
			moveEvt.preventDefault();

			var shift = startCoordX - moveEvt.clientX;
			startCoordX = moveEvt.clientX;
			var pinPosition = (effectLevelPin.offsetLeft - shift) * 100 / 453; // 453?
			setPinPosition(pinPosition);
			setEffectLevel();
		};

		var mouseUpHandler = function (upEvt) {
			upEvt.preventDefault();

			document.removeEventListener('mousemove', mouseMoveHandler);
			document.removeEventListener('mouseup', mouseUpHandler);
		};

		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('mouseup', mouseUpHandler);
	};

	var effectsListClickHandler = function (evt) {
		if (evt.target.nodeName === 'INPUT') {
			previewImage.className = 'effects__preview--' + evt.target.value;
			effectLevelInput.value = EFFECT_LEVEL_INPUT_INITIAL_VALUE;
			setEffectLevel();
			setPinPosition(PIN_INITIAL_VALUE);
		}

		if (evt.target.value === 'none') {
			effectLevelSlider.classList.add('hidden');
		} else {
			effectLevelSlider.classList.remove('hidden');
		}
	};

	var isArrayWithoutDuplicates = function (array) {
		var arrayToLowerCase = array.map(function (element) {
			return element.toLowerCase();
		});

		arrayToLowerCase.sort();

		var arrayWithoutDuplicates = [];
		var _temp;

		for (var i = 0; i < arrayToLowerCase.length; i += 1) {
			if (arrayToLowerCase[i] !== _temp) {
				arrayWithoutDuplicates.push(arrayToLowerCase[i]);
				_temp = arrayToLowerCase[i];
			} else {
				return false;
			}
		}

		return true;
	};

	var validateHashTagsInput = function () {
		if (hashTagsInput.value === '') {
			return;
		}

		var hashTags = hashTagsInput.value.split(' ');

		if (hashTags.length > MAX_HASH_TAGS_AMOUNT) {
			hashTagsInput.setCustomValidity(HashTagErrorMessage.TOO_BIG_QUANTITY);
		} else if (!isArrayWithoutDuplicates(hashTags)) {
			hashTagsInput.setCustomValidity(HashTagErrorMessage.HAVE_DUPLICATES);
		} else {
			for (var i = 0; i < hashTags.length; i += 1) {
				if (hashTags[i][0] !== '#') {
					hashTagsInput.setCustomValidity(HashTagErrorMessage.NOT_BEGINS_WITH_HASH);
					break;
				} else if (hashTags[i] === '#') {
					hashTagsInput.setCustomValidity(HashTagErrorMessage.NO_CONTENT_AFTER_HASH);
					break;
				} else if (hashTags[i].length > MAX_HASH_TAG_LENGTH) {
					hashTagsInput.setCustomValidity(HashTagErrorMessage.TOO_LONG);
					break;
				} else if (hashTags[i].indexOf('#', 1) !== -1) {
					hashTagsInput.setCustomValidity(HashTagErrorMessage.NOT_SEPARATED_WITH_SPACE);
					break;
				} else {
					hashTagsInput.setCustomValidity('');
				}
			}
		}
	};

	var saveSuccessHandler = function () {
		closeUploadFilePopup();
	};

	var saveErrorHandler = function (errorMessage) {
		window.util.renderErrorMessage(errorMessage);
	};

	var uploadFormSubmitHandler = function (evt) {
		window.backend.save(new FormData(uploadForm), saveSuccessHandler, saveErrorHandler);
		evt.preventDefault();
	};

	hashTagsInput.addEventListener('blur', function () {
		validateHashTagsInput();
	});

	effectLevelPin.addEventListener('mousedown', effectLevelPinMouseDownHandler);
	effectsList.addEventListener('click', effectsListClickHandler);
	uploadForm.addEventListener('submit', uploadFormSubmitHandler);
})();
