# Deep Learning — 선형회귀 시뮬레이터

원본 Linear Regression 교육용 사이트의 화면 구성과 주요 기능을 참고한 React + TypeScript 구현입니다.

## 시작

```powershell
cd C:\Users\user\Desktop\Deep\frontend
npm install
npm run dev
```

> 위 경로는 프로젝트를 `Deep` 저장소의 `frontend` 폴더에 복사한 경우입니다.

## 기존 프로젝트에 적용

이미 Vite + React 프로젝트가 있다면 압축 파일의 다음 두 파일을 기존 프로젝트에 복사해 덮어쓰면 됩니다.

- `frontend/src/App.tsx`
- `frontend/src/App.css`

`frontend/src/main.tsx`가 `./App.css`를 import하는지 확인하세요. 또는 기존 `main.tsx`에서 CSS import를 추가하면 됩니다.

`package.json`과 `index.html`은 프로젝트를 새로 구성할 때 사용하는 예시입니다. 기존 프로젝트를 유지하려면 덮어쓰지 마세요.

## 주요 기능

- 선형회귀 그래프: 데이터 점 및 예측 직선 표시
- Cost Function: 가중치/편향 영역별 비용을 단계별 색상으로 표시
- 그래프 클릭으로 데이터 추가
- 데이터 표에서 x, y 직접 수정
- 데이터 추가/삭제, 기본값 복원
- 슬라이더로 가중치, 편향 직접 조절
- Learn / Stop / Reset: 경사하강법 반복 학습
- 학습률 조절
- 최소제곱법의 해석적 해 바로 구하기

## 수학

- 예측: `h(x) = w*x + b`
- 비용: `J(w,b) = (1/2) * Σ(h(x_i)-y_i)^2`
- 편미분: `dJ/dw = Σ((h(x_i)-y_i)*x_i)`, `dJ/db = Σ(h(x_i)-y_i)`
- 경사하강법: `w -= learningRate * dJ/dw`, `b -= learningRate * dJ/db`

## 참고

- 현재는 **프론트엔드 동작 데모**이며 모든 계산은 브라우저 TypeScript에서 수행합니다.
- 교수님이 Python 구현을 요구하셨다면 추후 Python으로 동일 알고리즘을 구현하고 FastAPI로 연결해야 합니다.
- 원본 사이트와 픽셀 단위 동일하지 않으며 등고선은 이산 색상 히트맵으로 근사한 구현입니다.
