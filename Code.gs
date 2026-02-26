const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheets()[0];

function doGet(e) {
  if (!e || !e.parameter) return ContentService.createTextOutput("URL로 접속하세요.");
  const action = e.parameter.action;
  
  if (action === 'read') {
    const page = parseInt(e.parameter.page) || 1; // 요청 페이지 (기본값 1)
    const pageSize = 10;
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return ContentService.createTextOutput(JSON.stringify({posts: [], totalPages: 0})).setMimeType(ContentService.MimeType.JSON);

    // 전체 데이터 개수 (헤더 제외)
    const totalPosts = lastRow - 1;
    const totalPages = Math.ceil(totalPosts / pageSize);
    
    // 역순 정렬을 위해 최신 데이터 위치 계산
    // 예: 1페이지는 가장 마지막 행부터 10개
    let startRow = lastRow - (page - 1) * pageSize;
    let numRows = Math.min(pageSize, startRow - 1);
    
    if (startRow <= 1) {
       return ContentService.createTextOutput(JSON.stringify({posts: [], totalPages: totalPages})).setMimeType(ContentService.MimeType.JSON);
    }

    // 필요한 10개 행만 가져오기
    const range = sheet.getRange(startRow - numRows + 1, 1, numRows, 6);
    const data = range.getValues().reverse(); // 최신순 정렬
    const headers = sheet.getRange(1, 1, 1, 6).getValues()[0];

    const posts = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => { if(h !== 'Password') obj[h] = row[i]; });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({
      posts: posts,
      totalPages: totalPages
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// doPost는 이전과 동일합니다. (수정/삭제/생성 로직 유지)
function doPost(e) {
  // CORS 해결을 위한 헤더 설정 및 예외 처리
  try {
    const params = e.parameter;
    const action = params.action;
    
    // 1. 게시글 생성 (Create)
    if (action === 'create') {
      const author = params.author || "익명";
      const password = params.password || "";
      const title = params.title || "제목 없음";
      const content = params.content || "";
      const date = new Date();
      const id = Utilities.getUuid(); // 고유 ID 생성

      // 스프레드시트 구조: ID, Author, Title, Content, Password, Date (총 6컬럼)
      sheet.appendRow([id, author, title, content, password, date]);

      return ContentService.createTextOutput(JSON.stringify({ 
        result: "success", 
        message: "저장되었습니다." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. 수정/삭제 등 추가 로직이 필요하다면 여기에 작성
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "fail", 
      message: "알 수 없는 액션입니다." 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}