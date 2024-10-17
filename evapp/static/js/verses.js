// verses.js

document.addEventListener('DOMContentLoaded', function () {
    // 모달 표시/숨기기 함수
    function modalAction(modal, displayStyle) {
        modal.style.display = displayStyle;
    }

    const elements = {
        left: {
            modal: document.getElementById('left-modal'),
            btn: document.getElementById('left-btn'),
            close: document.querySelector('.left-close'),
            selectIds: ['brand', 'type', 'fuel', 'model', 'detail-model', 'trim']
        },
        right: {
            modal: document.getElementById('right-modal'),
            btn: document.getElementById('right-btn'),
            close: document.querySelector('.right-close'),
            selectIds: ['brand', 'type', 'fuel', 'model', 'detail-model', 'trim']
        }
    };

    // 비교할 모든 사양의 목록 정의
    const specsList = [
        'brand', 'image', 'model', 'detail-model', 'type', 'trim', 'price',
        'length', 'width', 'height', 'wheelbase', 'front-tread', 'rear-tread',
        'front-overhang', 'rear-overhang', 'engine', 'displacement',
        'max-power', 'max-torque', 'max-speed', 'acceleration',
        'fuel', 'fuel-tank', 'co2-emission', 'battery-capacity',
        'transmission', 'drive-type', 'front-tire', 'rear-tire',
        'front-wheel', 'rear-wheel', 'parking-assist', 'driving-safety',
        'pedestrian-safety', 'airbag', 'door-pocket-light',
        'ambient-light', 'room-mirror', 'seating-capacity',
        'seat-layout', 'seat-material', 'dashboard', 'steering-wheel',
        'sound-system', 'speaker', 'cargo-capacity', 'trunk',
        'ac', 'engine-start'
    ];

    // 사양 ID에 해당하는 라벨을 반환하는 함수
    function getSpecLabel(specId) {
        const specLabels = {
            brand: '브랜드', model: '모델명', 'detail-model': '세부모델명', type: '차종', trim: '트림명', price: '가격',
            length: '전장', width: '전폭', height: '전고', wheelbase: '축거', 'front-tread': '윤거 전', 'rear-tread': '윤거 후',
            'front-overhang': '오버행 전', 'rear-overhang': '오버행 후', engine: '엔진형식', displacement: '배기량',
            'max-power': '최고출력', 'max-torque': '최대토크', 'max-speed': '최고속도', acceleration: '제로백',
            fuel: '연료', 'fuel-tank': '연료탱크', 'co2-emission': 'CO2 배출', 'battery-capacity': '배터리 용량',
            transmission: '변속기', 'drive-type': '굴림방식', 'front-tire': '타이어 전', 'rear-tire': '타이어 후',
            'front-wheel': '휠 전', 'rear-wheel': '휠 후', 'parking-assist': '주차보조', 'driving-safety': '주행안전',
            'pedestrian-safety': '보행자 안전', airbag: '에어백', 'door-pocket-light': '도어포켓 라이트',
            'ambient-light': '엠비언트 라이트', 'room-mirror': '룸미러', 'seating-capacity': '승차정원',
            'seat-layout': '시트 배열', 'seat-material': '시트 재질', dashboard: '계기판', 'steering-wheel': '스티어링 휠',
            'sound-system': '사운드 시스템', speaker: '스피커', 'cargo-capacity': '적재량', trunk: '트렁크',
            ac: '에어컨', 'engine-start': '엔진 시동'
        };
        return specLabels[specId] || specId;
    }

    // 모달 버튼과 닫기 버튼 이벤트 설정
    Object.keys(elements).forEach(side => {
        elements[side].btn.onclick = () => modalAction(elements[side].modal, 'block');
        elements[side].close.onclick = () => modalAction(elements[side].modal, 'none');
    });

    // 화면 외부 클릭으로 모달 닫기
    window.onclick = function(event) {
        Object.values(elements).forEach(({ modal }) => {
            if (event.target == modal) modalAction(modal, 'none');
        });
    };

    // 선택 박스 업데이트와 초기화 함수
    function updateSelectBox(selectId, options) {
        const selectBox = document.getElementById(selectId);
        selectBox.innerHTML = '<option value="">선택</option>';
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.innerHTML = option;
            selectBox.appendChild(opt);
        });
    }

    function resetSelectBox(selectId) {
        document.getElementById(selectId).innerHTML = '<option value="">선택</option>';
    }

    // 모든 하위 선택 박스를 초기화하는 함수
    function resetSubSelectsFrom(selectId, side) {
        const allSelects = elements[side].selectIds;
        const startIndex = allSelects.indexOf(selectId) + 1;
        const subSelects = allSelects.slice(startIndex);
        subSelects.forEach(select => resetSelectBox(`${side}-${select}`));
    }

    // API 요청 함수
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return null;
        }
    }

    // 페이지 로드 시 브랜드 목록 로드
    async function loadInitialBrands() {
        const data = await fetchData('/api/car/');
        if (data?.brands) {
            updateSelectBox('left-brand', data.brands);
            updateSelectBox('right-brand', data.brands);
        }
    }

    loadInitialBrands();

    // 데이터 기반 목록 갱신 함수
    async function fetchOptions(brand, car_type, fuel, model, detail_model, endpoint, selectId) {
        const url = new URL(`/api/car/`, window.location.origin);
        if (brand) url.searchParams.append('brand', brand);
        if (car_type) url.searchParams.append('car_type', car_type);
        if (fuel) url.searchParams.append('fuel', fuel);
        if (model) url.searchParams.append('model', model);
        if (detail_model) url.searchParams.append('detail_model', detail_model);

        const data = await fetchData(url);
        if (data && data[endpoint]) {
            updateSelectBox(selectId, data[endpoint]);
        }
    }

    // 차량 스펙을 가져오는 함수 수정
    async function fetchCarSpecs(side) {
        const ids = elements[side].selectIds;
        const [brand, car_type, fuel, model, detail_model, trim] = ids.map(id => document.getElementById(`${side}-${id}`).value);

        // 모든 값이 채워져 있는지 확인
        if (!brand || !car_type || !fuel || !model || !detail_model || !trim) {
            alert('모든 값을 선택해주세요.');
            return;
        }

        const url = `/api/spec/?brand=${encodeURIComponent(brand)}&car_type=${encodeURIComponent(car_type)}&fuel=${encodeURIComponent(fuel)}&model=${encodeURIComponent(model)}&detail_model=${encodeURIComponent(detail_model)}&trim=${encodeURIComponent(trim)}`;
        const data = await fetchData(url);
        if (data?.specs) {
            console.log('Specs:', data.specs);
            displaySpecs(data.specs, side);

            // 모든 사양이 채워진 후 공통으로 없는 사양을 숨기는 함수 호출
            hideCommonMissingSpecs();

            // 모달 닫기
            modalAction(elements[side].modal, 'none');
        } else {
            alert('해당 차량의 정보를 찾을 수 없습니다.');
        }
    }

    // 차량 스펙 표시 함수 수정
    function displaySpecs(specs, side) {
        const specIds = {
            brand: '브랜드', model: '모델명', 'detail-model': '세부모델명', type: '차종', trim: '트림명', price: '가격',
            length: '전장', width: '전폭', height: '전고', wheelbase: '축거', 'front-tread': '윤거 전', 'rear-tread': '윤거 후',
            'front-overhang': '오버행 전', 'rear-overhang': '오버행 후', engine: '엔진형식', displacement: '배기량',
            'max-power': '최고출력', 'max-torque': '최대토크', 'max-speed': '최고속도', acceleration: '제로백',
            fuel: '연료', 'fuel-tank': '연료탱크', 'co2-emission': 'CO2 배출', 'battery-capacity': '배터리 용량',
            transmission: '변속기', 'drive-type': '굴림방식', 'front-tire': '타이어 전', 'rear-tire': '타이어 후',
            'front-wheel': '휠 전', 'rear-wheel': '휠 후', 'parking-assist': '주차보조', 'driving-safety': '주행안전',
            'pedestrian-safety': '보행자 안전', airbag: '에어백', 'door-pocket-light': '도어포켓 라이트',
            'ambient-light': '엠비언트 라이트', 'room-mirror': '룸미러', 'seating-capacity': '승차정원',
            'seat-layout': '시트 배열', 'seat-material': '시트 재질', dashboard: '계기판', 'steering-wheel': '스티어링 휠',
            'sound-system': '사운드 시스템', speaker: '스피커', 'cargo-capacity': '적재량', trunk: '트렁크',
            ac: '에어컨', 'engine-start': '엔진 시동', image: '사진'
        };

        for (let [id, label] of Object.entries(specIds)) {
            const element = document.getElementById(`${side}-${id}-spec`);

            if (label === '가격' && specs[label]) {
                // 가격을 1,000,000 원 형식으로 표시
                const formattedPrice = parseInt(specs[label]).toLocaleString() + ' 원';
                element.innerHTML = formattedPrice;
            } else if ((label === '승차정원' || label === '스피커') && specs[label]) {
                // 승차정원과 스피커에서 소수점 없애기
                element.innerHTML = formatNumberWithoutTrailingZero(parseFloat(specs[label]));
            } else if (label === '사진' && specs[label]) {
                // 사진 표시 (이미지 크기 조정: width를 100px으로 축소)
                const imagePath = `${staticUrl}${specs[label]}`;
                element.innerHTML = `<img src="${imagePath}" alt="${specs['모델명']}" style="width: auto; height: 200px;">`;
            } else {
                element.innerHTML = specs[label] ?? '';
            }
        }

        // 연비와 전비 조건 수정: 각 값이 `null`, `undefined` 또는 빈 문자열이 아닌 경우
        const combinedFuel = specs.복합연비 || specs.복합전비;
        const highwayFuel = specs.고속연비 || specs.고속전비;
        const cityFuel = specs.도심연비 || specs.도심전비;

        document.getElementById(`${side}-combined-fuel-efficiency-spec`).innerHTML =
            combinedFuel ? `${formatNumberWithoutTrailingZero(parseFloat(combinedFuel))} ${specs.복합연비 ? 'km/L' : 'km/kWh'}` : '';

        document.getElementById(`${side}-highway-fuel-efficiency-spec`).innerHTML =
            highwayFuel ? `${formatNumberWithoutTrailingZero(parseFloat(highwayFuel))} ${specs.고속연비 ? 'km/L' : 'km/kWh'}` : '';

        document.getElementById(`${side}-city-fuel-efficiency-spec`).innerHTML =
            cityFuel ? `${formatNumberWithoutTrailingZero(parseFloat(cityFuel))} ${specs.도심연비 ? 'km/L' : 'km/kWh'}` : '';
    }

    // Debounce 함수: 입력 후 일정 시간 대기 후 실행
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 텍스트 하이라이트 함수 (안전하게 구현)
    function highlightText(text, query) {
        if (!query) return text;

        // 정규식을 사용하여 검색어를 찾아 <mark> 태그로 감싸기
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // 정규식 특수 문자 이스케이프 함수
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 검색 결과 표시 함수 수정: 이미지 포함 및 검색어 하이라이트
    function displaySearchResults(results, side) {
        const searchResultsContainer = document.getElementById(`${side}-search-results`);
        searchResultsContainer.innerHTML = ''; // 기존 결과 초기화

        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
            return;
        }

        const query = document.getElementById(`${side}-search`).value.trim().toLowerCase();

        results.forEach(car => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');

            // 이미지 요소 생성
            const img = document.createElement('img');
            img.src = `${staticUrl}${car.사진}`; // 이미지 경로 설정
            img.alt = `${car.모델명}`;
            img.classList.add('search-result-image');

            // 이미지 로딩 오류 시 대체 이미지 설정
            img.onerror = function() {
                this.src = '/static/image/default_car.png'; // 기본 이미지 경로
            };

            // 텍스트 요소 생성 및 하이라이트
            const text = document.createElement('span');
            text.innerHTML = highlightText(`${car.브랜드} ${car.모델명} ${car.세부모델명} ${car.트림명}`, query);

            // 이미지와 텍스트를 결과 항목에 추가
            resultItem.appendChild(img);
            resultItem.appendChild(text);

            // 클릭 이벤트 설정
            resultItem.onclick = () => {
                // 클릭 시 해당 차량의 스펙을 가져오기
                populateSelectsFromSearch(car, side);
                searchResultsContainer.innerHTML = ''; // 결과 초기화
                document.getElementById(`${side}-search`).value = ''; // 검색창 초기화
            };
            searchResultsContainer.appendChild(resultItem);
        });
    }

    // 선택된 검색 결과를 기반으로 셀렉트 박스 채우기
    async function populateSelectsFromSearch(car, side) {
        document.getElementById(`${side}-brand`).value = car.브랜드;
        await fetchOptions(car.브랜드, null, null, null, null, 'types', `${side}-type`);
        document.getElementById(`${side}-type`).value = car.차종;
        await fetchOptions(car.브랜드, car.차종, null, null, null, 'fuels', `${side}-fuel`);
        document.getElementById(`${side}-fuel`).value = car.연료;
        await fetchOptions(car.브랜드, car.차종, car.연료, null, null, 'models', `${side}-model`);
        document.getElementById(`${side}-model`).value = car.모델명;
        await fetchOptions(car.브랜드, car.차종, car.연료, car.모델명, null, 'detail_models', `${side}-detail-model`);
        document.getElementById(`${side}-detail-model`).value = car.세부모델명;
        await fetchOptions(car.브랜드, car.차종, car.연료, car.모델명, car.세부모델명, 'trims', `${side}-trim`);
        document.getElementById(`${side}-trim`).value = car.트림명;

        // 모든 셀렉트 박스가 업데이트된 후 스펙을 가져옵니다.
        fetchCarSpecs(side);
    }

    // 검색 입력 처리 함수
    async function handleSearchInput(side) {
        const query = document.getElementById(`${side}-search`).value.trim();
        if (query.length < 2) { // 최소 2자 이상 입력 시 검색
            document.getElementById(`${side}-search-results`).innerHTML = '';
            return;
        }

        const url = `/api/car/?search=${encodeURIComponent(query)}`;
        const data = await fetchData(url);
        if (data?.search_results) {
            displaySearchResults(data.search_results, side);
        }
    }

    // Debounced 검색 입력 처리
    const debouncedHandleSearchLeft = debounce(() => handleSearchInput('left'), 300);
    const debouncedHandleSearchRight = debounce(() => handleSearchInput('right'), 300);

    // 검색 입력 이벤트 리스너 추가
    document.getElementById('left-search').addEventListener('input', debouncedHandleSearchLeft);
    document.getElementById('right-search').addEventListener('input', debouncedHandleSearchRight);

    // 차량 선택을 위한 이벤트 리스너 설정 함수
    function setEventListeners(side) {
        const selects = elements[side].selectIds;

        document.getElementById(`${side}-brand`).addEventListener('change', async function() {
            resetSubSelectsFrom('brand', side);  // 모든 하위 선택 초기화
            await fetchOptions(this.value, null, null, null, null, 'types', `${side}-type`);
        });

        document.getElementById(`${side}-type`).addEventListener('change', async function() {
            resetSubSelectsFrom('type', side);  // 모든 하위 선택 초기화
            const brand = document.getElementById(`${side}-brand`).value;
            await fetchOptions(brand, this.value, null, null, null, 'fuels', `${side}-fuel`);
        });

        document.getElementById(`${side}-fuel`).addEventListener('change', async function() {
            resetSubSelectsFrom('fuel', side);  // 모든 하위 선택 초기화
            const brand = document.getElementById(`${side}-brand`).value;
            const car_type = document.getElementById(`${side}-type`).value;
            await fetchOptions(brand, car_type, this.value, null, null, 'models', `${side}-model`);
        });

        document.getElementById(`${side}-model`).addEventListener('change', async function() {
            resetSubSelectsFrom('model', side);  // 모든 하위 선택 초기화
            const brand = document.getElementById(`${side}-brand`).value;
            const car_type = document.getElementById(`${side}-type`).value;
            const fuel = document.getElementById(`${side}-fuel`).value;
            await fetchOptions(brand, car_type, fuel, this.value, null, 'detail_models', `${side}-detail-model`);
        });

        document.getElementById(`${side}-detail-model`).addEventListener('change', async function() {
            resetSubSelectsFrom('detail-model', side);  // 트림 초기화
            const brand = document.getElementById(`${side}-brand`).value;
            const car_type = document.getElementById(`${side}-type`).value;
            const fuel = document.getElementById(`${side}-fuel`).value;
            const model = document.getElementById(`${side}-model`).value;
            await fetchOptions(brand, car_type, fuel, model, this.value, 'trims', `${side}-trim`);
        });

        document.getElementById(`${side}-confirm`).addEventListener('click', () => fetchCarSpecs(side));
    }

    // 소수점 없는 숫자를 처리하는 함수
    function formatNumberWithoutTrailingZero(number) {
        return Number.isInteger(number) ? number : number.toFixed(1).replace(/\.0$/, '');
    }

    // 왼쪽, 오른쪽 이벤트 리스너 설정
    setEventListeners('left');
    setEventListeners('right');

    // 새로운 검색 결과 컨테이너 추가 (모달 내부에)
    function addSearchResultsContainer() {
        ['left', 'right'].forEach(side => {
            const modalDiv = document.querySelector(`#${side}-modal .modal-div`);
            const searchResults = document.createElement('div');
            searchResults.id = `${side}-search-results`;
            searchResults.classList.add('search-results');
            modalDiv.insertBefore(searchResults, document.getElementById(`${side}-confirm`));
        });
    }

    addSearchResultsContainer();

    // 공통으로 없는 사양을 숨기는 함수 추가
    function hideCommonMissingSpecs() {
        specsList.forEach(spec => {
            // 'image' 사양은 이미지가 항상 존재하므로 제외
            if (spec === 'image') return;

            const leftSpec = document.getElementById(`left-${spec}-spec`).innerText.trim();
            const rightSpec = document.getElementById(`right-${spec}-spec`).innerText.trim();

            if (!leftSpec && !rightSpec) {
                // 해당 사양의 테이블 행을 숨김
                const specLabel = getSpecLabel(spec);
                const allRows = document.querySelectorAll('.comparison-table tbody tr');

                allRows.forEach(row => {
                    const firstTd = row.querySelector('td:first-child');
                    if (firstTd && firstTd.innerText.trim() === specLabel) {
                        row.style.display = 'none';
                    }
                });
            } else {
                // 사양이 존재하면 보이도록 설정
                const specLabel = getSpecLabel(spec);
                const allRows = document.querySelectorAll('.comparison-table tbody tr');

                allRows.forEach(row => {
                    const firstTd = row.querySelector('td:first-child');
                    if (firstTd && firstTd.innerText.trim() === specLabel) {
                        row.style.display = '';
                    }
                });
            }
        });
    }

});
