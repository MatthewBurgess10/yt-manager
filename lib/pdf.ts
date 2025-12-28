import { supabaseAdmin } from './supabase';
import puppeteer from 'puppeteer';

interface PDFData {
  channel: {
    name: string;
    subscriberCount: number;
  };
  topQuestions: Array<{
    label: string;
    commentCount: number;
    examples: string[];
  }>;
  videoIdeas: Array<{
    title: string;
    relatedTopic: string;
  }>;
  replyOpportunities: Array<{
    commentText: string;
    reason: string;
    suggestedReply: string;
  }>;
  pinnedComment: string | null;
}

export async function generateAnalysisPDF(
  jobId: string,
  channelId: string
): Promise<string> {
  try {
    // Fetch data for PDF
    const { data: job } = await supabaseAdmin
      .from('analysis_jobs')
      .select(`
        *,
        channels (
          channel_name,
          subscriber_count
        )
      `)
      .eq('id', jobId)
      .single();

    if (!job) throw new Error('Job not found');

    const { data: clusters } = await supabaseAdmin
      .from('clusters')
      .select(`
        *,
        cluster_comments (
          comments (
            text
          )
        )
      `)
      .eq('analysis_job_id', jobId)
      .order('rank', { ascending: true });

    const { data: replyOpportunities } = await supabaseAdmin
      .from('reply_opportunities')
      .select(`
        *,
        comments (
          text
        )
      `)
      .eq('analysis_job_id', jobId)
      .order('priority_score', { ascending: false })
      .limit(10);

    // Format data
    const pdfData: PDFData = {
      channel: {
        name: job.channels.channel_name,
        subscriberCount: job.channels.subscriber_count || 0,
      },
      topQuestions: clusters?.map(c => ({
        label: c.label,
        commentCount: c.comment_count,
        examples: c.cluster_comments
          ?.slice(0, 3)
          .map((cc: any) => cc.comments.text)
          .filter(Boolean) || [],
      })) || [],
      videoIdeas: clusters
        ?.filter(c => c.video_idea)
        .slice(0, 10)
        .map(c => ({
          title: c.video_idea,
          relatedTopic: c.label,
        })) || [],
      replyOpportunities: replyOpportunities?.map(opp => ({
        commentText: opp.comments?.text || '',
        reason: opp.reason,
        suggestedReply: opp.suggested_reply,
      })) || [],
      pinnedComment: clusters?.[0]?.suggested_pinned_reply || null,
    };

    // Generate HTML
    const html = generatePDFHTML(pdfData);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    // Upload to Supabase Storage
    const fileName = `analysis-${jobId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('pdfs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

function generatePDFHTML(data: PDFData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #4f46e5;
    }
    
    .header h1 {
      font-size: 32px;
      color: #4f46e5;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      color: #666;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .question-item {
      margin-bottom: 25px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #4f46e5;
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .question-label {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .question-count {
      font-size: 14px;
      color: #6b7280;
    }
    
    .example {
      margin: 8px 0;
      padding: 10px;
      background: white;
      border-radius: 4px;
      font-size: 14px;
      color: #4b5563;
      font-style: italic;
    }
    
    .video-idea {
      margin-bottom: 15px;
      padding: 12px;
      background: #f0f9ff;
      border-radius: 6px;
      border-left: 3px solid #0ea5e9;
    }
    
    .video-title {
      font-size: 16px;
      font-weight: 600;
      color: #0c4a6e;
      margin-bottom: 5px;
    }
    
    .video-topic {
      font-size: 13px;
      color: #64748b;
    }
    
    .reply-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #fefce8;
      border-radius: 6px;
      border-left: 3px solid #eab308;
    }
    
    .comment-text {
      font-size: 14px;
      color: #1a1a1a;
      margin-bottom: 10px;
      font-style: italic;
    }
    
    .reply-reason {
      font-size: 13px;
      color: #78716c;
      margin-bottom: 8px;
    }
    
    .suggested-reply {
      font-size: 14px;
      color: #292524;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    
    .pinned-comment-box {
      padding: 20px;
      background: #f0fdf4;
      border-radius: 8px;
      border: 2px solid #22c55e;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>YouTube Channel Analysis</h1>
    <p>${data.channel.name} • ${data.channel.subscriberCount.toLocaleString()} subscribers</p>
    <p style="margin-top: 10px; font-size: 14px;">Generated by Replyt</p>
  </div>

  <div class="section">
    <h2 class="section-title">Top Questions & Topics</h2>
    ${data.topQuestions.map((q, i) => `
      <div class="question-item">
        <div class="question-header">
          <span class="question-label">${i + 1}. ${q.label}</span>
          <span class="question-count">${q.commentCount} comments</span>
        </div>
        ${q.examples.map(ex => `<div class="example">"${ex}"</div>`).join('')}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">Video Ideas</h2>
    ${data.videoIdeas.map((idea, i) => `
      <div class="video-idea">
        <div class="video-title">${i + 1}. ${idea.title}</div>
        <div class="video-topic">Addresses: ${idea.relatedTopic}</div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">Comments You Should Reply To</h2>
    ${data.replyOpportunities.slice(0, 8).map(opp => `
      <div class="reply-item">
        <div class="comment-text">"${opp.commentText}"</div>
        <div class="reply-reason"><strong>Why reply:</strong> ${opp.reason}</div>
        <div class="suggested-reply"><strong>Suggested reply:</strong> ${opp.suggestedReply}</div>
      </div>
    `).join('')}
  </div>

  ${data.pinnedComment ? `
    <div class="section">
      <h2 class="section-title">Suggested Pinned Comment</h2>
      <div class="pinned-comment-box">
        ${data.pinnedComment}
      </div>
    </div>
  ` : ''}

  <div class="footer">
    <p>Report generated on ${new Date().toLocaleDateString()}</p>
    <p>Powered by Replyt</p>
  </div>
</body>
</html>
  `;
}