
export const translations = {
  hero: {
    backButton: { en: "Back to Competitions", vi: "Trở về danh sách kỳ thi" },
    badge: { en: "Internal • Ended", vi: "Nội bộ • Đã kết thúc" },
    competitionDetail: { en: "Competition Detail", vi: "Chi tiết cuộc thi" },
    titlePrefix: { en: "Noders AI Competition", vi: "Noders AI Competition" },
    description: {
       en: "Our internal training ground where Noders members level up their AI skills through real competition. Build IELTS Writing scoring models, compete on the leaderboard, and earn both knowledge and rewards in a supportive learning environment.",
       vi: "Sân chơi nội bộ nơi các thành viên Noders nâng cao kỹ năng AI thông qua thi đấu thực tế. Xây dựng mô hình chấm điểm IELTS Writing, tranh tài trên bảng xếp hạng, và gặt hái kiến thức cùng phần thưởng trong một môi trường học tập hỗ trợ lẫn nhau."
    },
    stats: {
        members: { en: "16 Members Joined", vi: "16 Thành viên tham gia" },
        date: { en: "29 Nov - 28 Dec 2025", vi: "29/11 - 28/12/2025" }
    }
  },
  overview: {
     heading: { en: "Competition Overview & Rules", vi: "Tổng quan & Thể lệ cuộc thi" },
     aboutTitle: { en: "About NAIC 2025", vi: "Về NAIC 2025" },
     aboutText: {
        en: "NAIC 2025 is designed as a practical learning experience for Noders members to develop real AI skills through hands-on competition. Whether you're a seasoned AI team member or completely new to machine learning, this is your chance to train your first model, learn from detailed guides, and see your skills grow in a friendly, low-pressure environment.",
        vi: "NAIC 2025 được thiết kế như một trải nghiệm thực tế để thành viên Noders phát triển kỹ năng AI qua thi đấu. Dù bạn là thành viên team AI dày dạn kinh nghiệm hay người mới bắt đầu, đây là cơ hội để huấn luyện mô hình đầu tay, học hỏi từ hướng dẫn chi tiết và phát triển kỹ năng trong môi trường thân thiện, không áp lực."
     },
     targetTitle: { en: "Target Audience", vi: "Đối tượng tham gia" },
     targets: [
         {
             title: { en: "AI Team Members:", vi: "Thành viên Team AI:" },
             desc: { en: "Mandatory participation to practice and improve skills", vi: "Bắt buộc tham gia để rèn luyện và nâng cao kỹ năng" }
         },
         {
             title: { en: "Other Club Members:", vi: "Thành viên khác:" },
             desc: { en: "Optional participation - perfect for those curious about AI", vi: "Không bắt buộc - phù hợp cho những bạn tò mò về AI" }
         },
         {
             title: { en: "Beginners Welcome:", vi: "Chào đón người mới:" },
             desc: { en: "Detailed tutorial guides provided for first-time AI practitioners", vi: "Cung cấp hướng dẫn chi tiết cho người lần đầu làm quen AI" }
         }
     ],
     videoTitle: { en: "Rules Explanation & Q&A", vi: "Giải thích luật thi & Q&A" },
     videoDesc: { en: "Watch our detailed walkthrough of competition rules", vi: "Xem video hướng dẫn chi tiết về luật thi" },
     videoNote: { en: "This session covers all competition rules, submission guidelines, evaluation criteria, and answers frequently asked questions from participants.", vi: "Buổi chia sẻ bao gồm tất cả quy định cuộc thi, hướng dẫn nộp bài, tiêu chí đánh giá và giải đáp các thắc mắc thường gặp." }
  },
  timeline: {
     heading: { en: "Competition Timeline", vi: "Mốc thời gian" },
     items: [
         {
             date: { en: '29 Nov 2025', vi: '29/11/2025' },
             event: { en: 'Registration Opens', vi: 'Mở đơn đăng ký' },
             status: 'completed'
         },
         {
             date: { en: '29 Nov - 28 Dec', vi: '29/11 - 28/12' },
             event: { en: 'Active Competition Period', vi: 'Thời gian thi đấu' },
             status: 'completed'
         },
         {
             date: { en: '28 Dec 2025', vi: '28/12/2025' },
             event: { en: 'Final Submission Deadline', vi: 'Hạn chót nộp bài' },
             status: 'completed'
         }
     ]
  },
  leaderboard: {
      heading: { en: "Final Leaderboard", vi: "Bảng xếp hạng chung cuộc" },
      subheading: { en: "Competition ended on 28 Dec 2025 • Ranked by Mean Absolute Error (lower is better)", vi: "Cuộc thi kết thúc ngày 28/12/2025 • Xếp hạng theo Mean Absolute Error (thấp hơn là tốt hơn)" },
      columns: {
          rank: { en: "Rank", vi: "Hạng" },
          participant: { en: "Participant", vi: "Thí sinh" },
          submissions: { en: "Submissions", vi: "Số lần nộp" },
          mae: { en: "MAE ↓", vi: "MAE ↓" }
      },
      baselineName: { en: "Baseline (sample notebook score)", vi: "Baseline (điểm của notebook mẫu)" }
  },
  format: {
      heading: { en: "Competition Format", vi: "Hình thức thi" },
      details: [
        {
          title: { en: 'Online Competition', vi: 'Thi trực tuyến' },
          description: { en: 'Train your models locally or on Google Colab/Kaggle, then submit results online', vi: 'Huấn luyện mô hình offline hoặc trên Google Colab/Kaggle, sau đó nộp kết quả trực tuyến' }
        },
        {
          title: { en: 'Submit CSV Files', vi: 'Nộp file CSV' },
          description: { en: 'Download data, build your model, export submission.csv, and upload to our platform', vi: 'Tải dữ liệu, xây dựng mô hình, xuất file submission.csv và tải lên hệ thống' }
        },
        {
          title: { en: 'Provided Dataset Only', vi: 'Dữ liệu BTC cung cấp' },
          description: { en: 'Use only the competition dataset - external data is not permitted for fair competition', vi: 'Chỉ sử dụng bộ dữ liệu cuộc thi - không dùng dữ liệu ngoài để đảm bảo công bằng' }
        },
        {
          title: { en: 'Notebook Verification', vi: 'Xác minh Notebook' },
          description: { en: 'Top 4 winners must submit notebooks for verification before receiving prizes', vi: 'Top 4 thí sinh xuất sắc nhất phải nộp notebook để xác minh trước khi nhận giải' }
        }
      ]
  },
  content: {
     heading: { en: "Competition Content", vi: "Nội dung thi" },
     theme: {
         title: { en: "Challenge Theme", vi: "Chủ đề thử thách" },
         desc: { en: "Build an AI model to automatically score IELTS Writing Task 1 essays", vi: "Xây dựng mô hình AI tự động chấm điểm bài luận IELTS Writing Task 1" }
     },
     details: [
         {
             title: { en: "Dataset", vi: "Dữ liệu" },
             text: { en: "Essays with corresponding Band Scores provided by organizers", vi: "Các bài luận kèm điểm Band Score do BTC cung cấp" }
         },
         {
             title: { en: "Task", vi: "Nhiệm vụ" },
             text: { en: "Predict Band Scores for hidden test set essays", vi: "Dự đoán Band Score cho tập dữ liệu kiểm tra ẩn" }
         },
         {
             title: { en: "Evaluation", vi: "Đánh giá" },
             text: { en: "MAE (Mean Absolute Error) - Lower error means higher rank", vi: "MAE (Sai số tuyệt đối trung bình) - Sai số càng thấp thứ hạng càng cao" }
         },
         {
             title: { en: "Leaderboard", vi: "Bảng xếp hạng" },
             text: { en: "Real-time ranking based on submission accuracy", vi: "Xếp hạng thời gian thực dựa trên độ chính xác của bài nộp" }
         }
     ]
  },
  prizes: {
      heading: { en: "Prizes & Recognition", vi: "Giải thưởng & Quyền lợi" },
      subheading: { en: "Cash prizes plus club points for top performers", vi: "Giải thưởng tiền mặt và điểm cộng CLB cho thí sinh xuất sắc" },
      list: [
         {
          rank: { en: '1st Place', vi: 'Giải Nhất' },
          prize: { en: '200,000 VNĐ', vi: '200,000 VNĐ' },
          bonus: { en: '+ 25 Club Points', vi: '+ 25 Club Points' },
        },
        {
          rank: { en: '2nd Place', vi: 'Giải Nhì' },
          prize: { en: '100,000 VNĐ', vi: '100,000 VNĐ' },
          bonus: { en: '+ 20 Club Points', vi: '+ 20 Club Points' },
        },
        {
          rank: { en: '3rd Place (×3)', vi: 'Giải Ba (×3)' },
          prize: { en: '50,000 VNĐ each', vi: '50,000 VNĐ mỗi giải' },
          bonus: { en: '+ 15 Club Points', vi: '+ 15 Club Points' },
        }
      ],
      participation: { en: "All other participants earn valuable experience + 10 club points", vi: "Tất cả thí sinh tham gia khác nhận được kinh nghiệm quý báu + 10 club points" }
  },
  cta: {
      title: { en: "Join the Competition", vi: "Tham gia cuộc thi" },
      desc: { en: "Access the competition platform to download data, submit your predictions, and track your progress on the live leaderboard.", vi: "Truy cập nền tảng thi đấu để tải dữ liệu, nộp dự đoán và theo dõi tiến độ trên bảng xếp hạng trực tiếp." },
      button: { en: "Go to Competition Platform", vi: "Đi đến trang thi đấu" }
  }
}
